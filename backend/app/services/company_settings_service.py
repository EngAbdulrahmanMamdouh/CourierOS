from sqlalchemy.orm import Session

from app.crud.company_settings import (
    create_settings,
    get_settings_by_company_id,
    update_settings,
)
from app.models.user import User
from app.schemas.company_settings import CompanySettingsCreate, CompanySettingsUpdate
from app.services.tenant_context import is_platform_admin, require_company_context


def get_company_settings(db: Session, company_id: int, current_user: User):
    if is_platform_admin(current_user):
        return get_settings_by_company_id(db=db, company_id=company_id)

    if getattr(current_user, "role", None) in ("company_admin", "employee"):
        if current_user.company_id != company_id:
            raise PermissionError("Not authorized")
        return get_settings_by_company_id(db=db, company_id=company_id)

    raise PermissionError("Not authorized")


def create_company_settings(db: Session, settings_data: CompanySettingsCreate, current_user: User):
    if is_platform_admin(current_user):
        return create_settings(db=db, settings_data=settings_data)

    if getattr(current_user, "role", None) == "company_admin":
        if current_user.company_id != settings_data.company_id:
            raise PermissionError("Not authorized")
        return create_settings(db=db, settings_data=settings_data)

    raise PermissionError("Not authorized")


def update_company_settings(db: Session, company_id: int, settings_data: CompanySettingsUpdate, current_user: User):
    if is_platform_admin(current_user):
        return update_settings(db=db, company_id=company_id, settings_data=settings_data)

    if getattr(current_user, "role", None) == "company_admin":
        if current_user.company_id != company_id:
            raise PermissionError("Not authorized")
        return update_settings(db=db, company_id=company_id, settings_data=settings_data)

    raise PermissionError("Not authorized")
