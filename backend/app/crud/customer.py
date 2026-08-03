from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.services.permissions import require_permission
from app.services.tenant_context import get_current_company_id, is_platform_admin, require_company_context


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "create", "update"})


def get_all_customers(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(Customer)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Customer.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            (Customer.full_name.ilike(search_value)) |
            (Customer.phone.ilike(search_value)) |
            (Customer.company_name.ilike(search_value))
        )
    return query.order_by(Customer.id.desc()).offset(offset).limit(size).all()


def get_customer_by_id(db: Session, customer_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(Customer).filter(Customer.id == customer_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Customer.company_id == company_id)
    return query.first()


def create_customer(db: Session, customer_data: CustomerCreate, current_user=None):
    _ensure_access(current_user, "create")
    company_id = require_company_context(current_user) if not is_platform_admin(current_user) else None
    customer = Customer(
        full_name=customer_data.full_name,
        phone=customer_data.phone,
        email=customer_data.email,
        company_name=customer_data.company_name,
        address=customer_data.address,
        city=customer_data.city,
        notes=customer_data.notes,
        company_id=company_id,
        is_active=customer_data.is_active,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, customer_data: CustomerUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Customer).filter(Customer.id == customer_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Customer.company_id == company_id)
    customer = query.first()
    if customer is None:
        return None
    customer.full_name = customer_data.full_name
    customer.phone = customer_data.phone
    customer.email = customer_data.email
    customer.company_name = customer_data.company_name
    customer.address = customer_data.address
    customer.city = customer_data.city
    customer.notes = customer_data.notes
    customer.is_active = customer_data.is_active
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Customer).filter(Customer.id == customer_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Customer.company_id == company_id)
    customer = query.first()
    if customer is None:
        return None
    db.delete(customer)
    db.commit()
    return customer


def get_customer_shipments(db: Session, customer_id: int, current_user=None):
    _ensure_access(current_user, "view")
    from app.models.shipment import Shipment

    query = db.query(Shipment).filter(
        Shipment.customer_id == customer_id,
        Shipment.is_deleted == False,
    )

    if not is_platform_admin(current_user):
        company_id = get_current_company_id(current_user)
        if company_id is not None:
            query = query.filter(Shipment.company_id == company_id)

        if current_user.role == "employee":
            query = query.filter(
                (Shipment.owner_id == current_user.id) | (Shipment.assigned_to == current_user.id)
            )

    return query.order_by(Shipment.id.desc()).all()
