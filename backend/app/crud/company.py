from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


def get_company_by_id(db: Session, company_id: int):
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_code(db: Session, code: str):
    return db.query(Company).filter(Company.code == code).first()


def get_all_companies(db: Session, page: int = 1, size: int = 10):
    offset = (page - 1) * size
    return db.query(Company).offset(offset).limit(size).all()


def create_company(db: Session, company_data: CompanyCreate):
    existing = get_company_by_code(db, company_data.code)
    if existing:
        raise ValueError("Company code already exists")

    company = Company(
        name=company_data.name,
        code=company_data.code,
        email=company_data.email,
        phone=company_data.phone,
        address=company_data.address,
        city=company_data.city,
        country=company_data.country,
        tax_number=company_data.tax_number,
        commercial_register=company_data.commercial_register,
        logo_url=company_data.logo_url,
        subscription_plan=company_data.subscription_plan,
        subscription_status=company_data.subscription_status,
        is_active=company_data.is_active,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company_id: int, company_data: CompanyUpdate):
    company = get_company_by_id(db, company_id)
    if company is None:
        return None

    if company.code != company_data.code:
        if get_company_by_code(db, company_data.code) is not None:
            raise ValueError("Company code already exists")

    company.name = company_data.name
    company.code = company_data.code
    company.email = company_data.email
    company.phone = company_data.phone
    company.address = company_data.address
    company.city = company_data.city
    company.country = company_data.country
    company.tax_number = company_data.tax_number
    company.commercial_register = company_data.commercial_register
    company.logo_url = company_data.logo_url
    company.subscription_plan = company_data.subscription_plan
    company.subscription_status = company_data.subscription_status
    company.is_active = company_data.is_active

    db.commit()
    db.refresh(company)
    return company


def delete_company(db: Session, company_id: int):
    company = get_company_by_id(db, company_id)
    if company is None:
        return None

    db.delete(company)
    db.commit()
    return company
