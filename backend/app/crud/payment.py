from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.cod import COD
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.shipment import Shipment
from app.schemas.payment import PaymentCreate, PaymentUpdate
from app.services.audit_service import create_audit_log
from app.services.payment_service import normalize_payment_payload, validate_payment_method
from app.services.permissions import require_permission


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "read", "create"})


def _validate_payment(db: Session, payload, company_id: int | None = None, existing_payment_id: int | None = None):
    if float(payload.amount) <= 0:
        raise ValueError("Amount must be greater than zero")

    validate_payment_method(payload.payment_method)

    if payload.transaction_reference:
        query = db.query(Payment).filter(Payment.transaction_reference == payload.transaction_reference, Payment.is_deleted == False)
        if company_id is not None:
            query = query.filter(Payment.company_id == company_id)
        if existing_payment_id is not None:
            query = query.filter(Payment.id != existing_payment_id)
        if query.first() is not None:
            raise ValueError("Duplicate transaction reference is not allowed")

    if payload.shipment_id is None and payload.cod_id is None:
        raise ValueError("Payment must reference either a shipment or a COD record")

    if company_id is not None:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id, Customer.company_id == company_id).first()
        if customer is None:
            raise ValueError(f"Customer {payload.customer_id} does not belong to this company")

        if payload.shipment_id is not None:
            shipment = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
            if shipment is None:
                raise ValueError(f"Shipment {payload.shipment_id} does not belong to this company")
            if shipment.company_id is not None and shipment.company_id != company_id:
                raise ValueError(f"Shipment {payload.shipment_id} does not belong to this company")

        if payload.cod_id is not None:
            cod = db.query(COD).filter(COD.id == payload.cod_id).first()
            if cod is None:
                raise ValueError(f"COD {payload.cod_id} does not belong to this company")
            if cod.company_id is not None and cod.company_id != company_id:
                raise ValueError(f"COD {payload.cod_id} does not belong to this company")

    return True


def get_all_payments(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(Payment).filter(Payment.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(Payment.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            (Payment.currency.ilike(search_value)) |
            (Payment.payment_method.ilike(search_value)) |
            (Payment.payment_status.ilike(search_value)) |
            (Payment.transaction_reference.ilike(search_value))
        )
    return query.order_by(Payment.id.desc()).offset(offset).limit(size).all()


def get_payment_by_id(db: Session, payment_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(Payment).filter(Payment.id == payment_id, Payment.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(Payment.company_id == company_id)
    return query.first()


def _infer_payment_company_id(db: Session, payment_data, current_user=None):
    company_id = getattr(current_user, "company_id", None)
    if company_id is not None:
        return company_id

    if payment_data.customer_id is not None:
        customer = db.query(Customer).filter(Customer.id == payment_data.customer_id).first()
        if customer is not None:
            return customer.company_id

    if payment_data.shipment_id is not None:
        shipment = db.query(Shipment).filter(Shipment.id == payment_data.shipment_id).first()
        if shipment is not None:
            return shipment.company_id

    if payment_data.cod_id is not None:
        cod = db.query(COD).filter(COD.id == payment_data.cod_id).first()
        if cod is not None:
            return cod.company_id

    return None


def create_payment(db: Session, payment_data: PaymentCreate, current_user=None):
    _ensure_access(current_user, "create")
    payment_data = normalize_payment_payload(payment_data)
    company_id = _infer_payment_company_id(db, payment_data, current_user=current_user)
    if current_user.role != "admin" and company_id is None:
        raise PermissionError("Company context required")
    _validate_payment(db, payment_data, company_id=company_id)

    payment = Payment(
        shipment_id=payment_data.shipment_id,
        cod_id=payment_data.cod_id,
        customer_id=payment_data.customer_id,
        company_id=company_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        payment_method=payment_data.payment_method,
        payment_status=payment_data.payment_status,
        transaction_reference=payment_data.transaction_reference,
        paid_at=payment_data.paid_at,
        notes=payment_data.notes,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="create",
        entity="payment",
        entity_id=payment.id,
        description=f"Created payment {payment.transaction_reference}",
    )
    return payment


def update_payment(db: Session, payment_id: int, payment_data: PaymentUpdate, current_user=None):
    _ensure_access(current_user, "update")
    payment_data = normalize_payment_payload(payment_data)
    query = db.query(Payment).filter(Payment.id == payment_id, Payment.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(Payment.company_id == company_id)
    payment = query.first()
    if payment is None:
        return None

    company_id = getattr(current_user, "company_id", None) or payment.company_id or _infer_payment_company_id(db, payment_data, current_user=current_user)
    _validate_payment(db, payment_data, company_id=company_id, existing_payment_id=payment.id)

    payment.shipment_id = payment_data.shipment_id
    payment.cod_id = payment_data.cod_id
    payment.customer_id = payment_data.customer_id
    payment.company_id = company_id
    payment.amount = payment_data.amount
    payment.currency = payment_data.currency
    payment.payment_method = payment_data.payment_method
    payment.payment_status = payment_data.payment_status
    payment.transaction_reference = payment_data.transaction_reference
    payment.paid_at = payment_data.paid_at
    payment.notes = payment_data.notes
    db.commit()
    db.refresh(payment)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="update",
        entity="payment",
        entity_id=payment.id,
        description=f"Updated payment {payment.transaction_reference}",
    )
    return payment


def delete_payment(db: Session, payment_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Payment).filter(Payment.id == payment_id, Payment.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(Payment.company_id == company_id)
    payment = query.first()
    if payment is None:
        return None
    payment.is_deleted = True
    payment.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="payment",
        entity_id=payment.id,
        description=f"Soft deleted payment {payment.transaction_reference}",
    )
    return payment
