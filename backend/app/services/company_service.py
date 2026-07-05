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


def list_companies(db: Session, current_user: User, page: int = 1, size: int = 10):
    if current_user.role != "admin":
        raise PermissionError("Not authorized")
    return get_all_companies(db=db, page=page, size=size)


def get_company(db: Session, company_id: int, current_user: User):
    if current_user.role == "admin":
        return get_company_by_id(db=db, company_id=company_id)

    if current_user.role == "company_admin":
        company = get_company_by_id(db=db, company_id=company_id)
        if company is None or company.id != current_user.company_id:
            raise PermissionError("Not authorized")
        return company

    raise PermissionError("Not authorized")


def create_new_company(db: Session, company_data: CompanyCreate, current_user: User):
    if current_user.role != "admin":
        raise PermissionError("Not authorized")
    return create_company(db=db, company_data=company_data)


def update_existing_company(db: Session, company_id: int, company_data: CompanyUpdate, current_user: User):
    if current_user.role != "admin":
        raise PermissionError("Not authorized")
    return update_company(db=db, company_id=company_id, company_data=company_data)


def remove_company(db: Session, company_id: int, current_user: User):
    if current_user.role != "admin":
        raise PermissionError("Not authorized")
    return delete_company(db=db, company_id=company_id)
