from sqlalchemy.orm import Session

from app.crud.company import (
    create_company,
    delete_company,
    get_all_companies,
    get_company_by_id,
    update_company,
)
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.services.permissions import require_permission


def list_companies(db: Session, current_user: User, page: int = 1, size: int = 10):
    require_permission(current_user, "view", {"companies.view"})
    return get_all_companies(db=db, page=page, size=size)


def get_company(db: Session, company_id: int, current_user: User):
    require_permission(current_user, "view", {"companies.view"})

    if current_user.role == "company_admin":
        company = get_company_by_id(db=db, company_id=company_id)
        if company is None or company.id != current_user.company_id:
            raise PermissionError("Not authorized")
        return company

    return get_company_by_id(db=db, company_id=company_id)


def create_new_company(db: Session, company_data: CompanyCreate, current_user: User):
    require_permission(current_user, "manage", {"companies.manage"})
    return create_company(db=db, company_data=company_data)


def update_existing_company(db: Session, company_id: int, company_data: CompanyUpdate, current_user: User):
    require_permission(current_user, "manage", {"companies.manage"})
    return update_company(db=db, company_id=company_id, company_data=company_data)


def remove_company(db: Session, company_id: int, current_user: User):
    require_permission(current_user, "manage", {"companies.manage"})
    return delete_company(db=db, company_id=company_id)
