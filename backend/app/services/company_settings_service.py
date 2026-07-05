from sqlalchemy.orm import Session

from app.crud.company_settings import (
    create_settings,
    get_settings_by_company_id,
    update_settings,
)
from app.models.user import User
from app.schemas.company_settings import CompanySettingsCreate, CompanySettingsUpdate


def get_company_settings(db: Session, company_id: int, current_user: User):
    if current_user.role == "admin":
        return get_settings_by_company_id(db=db, company_id=company_id)

    if current_user.role == "company_admin":
        if current_user.company_id != company_id:
            raise PermissionError("Not authorized")
        return get_settings_by_company_id(db=db, company_id=company_id)

    if current_user.role == "employee":
        if current_user.company_id != company_id:
            raise PermissionError("Not authorized")
        return get_settings_by_company_id(db=db, company_id=company_id)

    raise PermissionError("Not authorized")


def create_company_settings(db: Session, settings_data: CompanySettingsCreate, current_user: User):
    if current_user.role == "admin":
        return create_settings(db=db, settings_data=settings_data)

    if current_user.role == "company_admin":
        if current_user.company_id != settings_data.company_id:
            raise PermissionError("Not authorized")
        return create_settings(db=db, settings_data=settings_data)

    raise PermissionError("Not authorized")


def update_company_settings(db: Session, company_id: int, settings_data: CompanySettingsUpdate, current_user: User):
    if current_user.role == "admin":
        return update_settings(db=db, company_id=company_id, settings_data=settings_data)

    if current_user.role == "company_admin":
        if current_user.company_id != company_id:
            raise PermissionError("Not authorized")
        return update_settings(db=db, company_id=company_id, settings_data=settings_data)

    raise PermissionError("Not authorized")
