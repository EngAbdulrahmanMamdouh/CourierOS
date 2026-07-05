from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.company_settings import (
    CompanySettingsCreate,
    CompanySettingsResponse,
    CompanySettingsUpdate,
)
from app.services.company_settings_service import (
    create_company_settings,
    get_company_settings,
    update_company_settings,
)

router = APIRouter(
    prefix="/company-settings",
    tags=["Company Settings"],
)


@router.get("/{company_id}", response_model=CompanySettingsResponse)
def read_company_settings(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        settings = get_company_settings(db=db, company_id=company_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company settings not found")

    return settings


@router.post("/", response_model=CompanySettingsResponse)
def create_settings(
    settings: CompanySettingsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_company_settings(db=db, settings_data=settings, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{company_id}", response_model=CompanySettingsResponse)
def update_settings(
    company_id: int,
    settings: CompanySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if settings.company_id != company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="company_id in body must match URL")

    try:
        updated = update_company_settings(db=db, company_id=company_id, settings_data=settings, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company settings not found")

    return updated
