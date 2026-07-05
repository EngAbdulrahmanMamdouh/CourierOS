import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.import_job import ImportJob
from app.services.audit_service import create_audit_log


def _ensure_access(current_user, action: str):
    if current_user is None:
        raise PermissionError("Not authorized")

    if current_user.role == "admin":
        return

    if action in {"view", "create"}:
        return

    raise PermissionError("Not authorized")


def _ensure_job_access(job: ImportJob, current_user):
    if current_user.role == "admin":
        return

    if job.uploaded_by != current_user.id:
        raise PermissionError("Not authorized")


def get_all_import_jobs(db: Session, current_user=None, page: int = 1, size: int = 10):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(ImportJob).filter(ImportJob.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(ImportJob.company_id == company_id)
    return query.order_by(ImportJob.id.desc()).offset(offset).limit(size).all()


def get_import_job_by_id(db: Session, job_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(ImportJob).filter(ImportJob.id == job_id, ImportJob.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(ImportJob.company_id == company_id)
    job = query.first()
    if job is None:
        return None
    _ensure_job_access(job, current_user)
    return job


def create_import_job(
    db: Session,
    file_name: str,
    uploaded_by: int,
    company_id: int | None = None,
    status: str = "Pending",
    total_rows: int = 0,
    imported_rows: int = 0,
    failed_rows: int = 0,
    duplicate_rows: int = 0,
    started_at=None,
    finished_at=None,
    report: str | None = None,
):
    job = ImportJob(
        file_name=file_name,
        uploaded_by=uploaded_by,
        company_id=company_id,
        status=status,
        total_rows=total_rows,
        imported_rows=imported_rows,
        failed_rows=failed_rows,
        duplicate_rows=duplicate_rows,
        started_at=started_at,
        finished_at=finished_at,
        report=report,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    create_audit_log(
        db=db,
        actor_id=uploaded_by,
        company_id=company_id,
        action="create",
        entity="import_job",
        entity_id=job.id,
        description=f"Created import job {job.id}",
    )
    return job


def update_import_job(db: Session, job_id: int, updates: dict, current_user=None):
    job = get_import_job_by_id(db, job_id, current_user=current_user)
    if job is None:
        return None
    for key, value in updates.items():
        if hasattr(job, key):
            setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job


def delete_import_job(db: Session, job_id: int, current_user=None):
    job = get_import_job_by_id(db, job_id, current_user=current_user)
    if job is None:
        return None
    job.is_deleted = True
    job.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)

    create_audit_log(
        db=db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="import_job",
        entity_id=job.id,
        description=f"Soft deleted import job {job.id}",
    )
    return job
