from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app.crud import import_job as import_job_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.import_job import ImportJobResponse, ImportPreviewResponse, ImportExecutionResponse, ImportSummaryResponse, ImportReportResponse
from app.services.import_service import (
    execute_import_workbook,
    preview_uploaded_workbook,
    store_uploaded_workbook,
    _create_template_workbook,
    _generate_error_report_bytes,
    _generate_duplicate_report_bytes,
    _get_import_summary,
)

router = APIRouter(
    prefix="/imports",
    tags=["Shipment Imports"],
)


@router.post("/shipments/upload", response_model=ImportJobResponse)
async def upload_shipment_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .xlsx files are supported")

    file_bytes = await file.read()

    try:
        return store_uploaded_workbook(db, file.filename, file_bytes, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/shipments/preview", response_model=ImportPreviewResponse)
async def preview_shipment_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .xlsx files are supported")

    file_bytes = await file.read()

    try:
        return preview_uploaded_workbook(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/shipments/execute", response_model=ImportExecutionResponse)
async def execute_shipment_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .xlsx files are supported")

    file_bytes = await file.read()

    try:
        return execute_import_workbook(db, file.filename, file_bytes, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/", response_model=list[ImportJobResponse])
def list_import_jobs(
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return import_job_crud.get_all_import_jobs(db=db, current_user=current_user, page=page, size=size)


@router.get("/{job_id}", response_model=ImportJobResponse)
def get_import_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = import_job_crud.get_import_job_by_id(db=db, job_id=job_id, current_user=current_user)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")
    return job


@router.get("/{job_id}/summary", response_model=ImportSummaryResponse)
def get_import_job_summary(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = import_job_crud.get_import_job_by_id(db=db, job_id=job_id, current_user=current_user)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")
    return _get_import_summary(job)


@router.get("/{job_id}/error-report", response_model=ImportReportResponse)
def download_error_report(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = import_job_crud.get_import_job_by_id(db=db, job_id=job_id, current_user=current_user)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")

    file_bytes = _generate_error_report_bytes(job)
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No error report available")

    return StreamingResponse(
        BytesIO(file_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=error_report_{job_id}.xlsx"},
    )


@router.get("/{job_id}/duplicate-report", response_model=ImportReportResponse)
def download_duplicate_report(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = import_job_crud.get_import_job_by_id(db=db, job_id=job_id, current_user=current_user)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")

    file_bytes = _generate_duplicate_report_bytes(job)
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No duplicate report available")

    return StreamingResponse(
        BytesIO(file_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=duplicate_report_{job_id}.xlsx"},
    )


@router.get("/templates/{template_name}")
def download_import_template(
    template_name: str,
    current_user: User = Depends(get_current_user),
):
    try:
        file_bytes = _create_template_workbook(template_name)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return StreamingResponse(
        BytesIO(file_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={template_name}_template.xlsx"},
    )


@router.delete("/{job_id}")
def delete_import_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = import_job_crud.delete_import_job(db=db, job_id=job_id, current_user=current_user)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import job not found")
    return {"message": "Import job deleted successfully"}
