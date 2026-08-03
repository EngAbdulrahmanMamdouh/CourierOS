from datetime import datetime, timezone
from types import SimpleNamespace

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.cod import COD
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.payment import Payment
from app.models.shipment import Shipment
from app.schemas.finance import CodCollectionResponse
from app.services.audit_service import create_audit_log
from app.services.payment_service import normalize_payment_payload, validate_payment_method
from app.services.permissions import require_permission
from app.services.tenant_context import get_current_company_id, is_platform_admin, require_company_context


def _ensure_access(current_user, action: str):
    allowed = {
        "view",
        "read",
        "collect",
        "settlement",
        "report",
    }
    return require_permission(current_user, action, allowed)


def _resolve_finance_company_id(current_user):
    if is_platform_admin(current_user):
        return None

    company_id = get_current_company_id(current_user)
    if company_id is None:
        return require_company_context(current_user)
    return company_id


def _validate_cod_collection(db: Session, shipment: Shipment, payload: dict, current_user=None):
    if payload["cash_tendered"] < payload["amount_due"]:
        raise ValueError("Collected amount cannot be lower than the COD due amount")

    if shipment.company_id is not None and not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        if shipment.company_id != company_id:
            raise PermissionError("Shipment does not belong to this company")

    if shipment.cod_amount is None or shipment.cod_amount <= 0:
        raise ValueError("Shipment is not configured for COD collection")

    return True


def collect_cod(db: Session, shipment_id: int, payload: dict, current_user=None):
    _ensure_access(current_user, "collect")

    shipment = db.query(Shipment).filter(Shipment.id == shipment_id, Shipment.is_deleted == False).first()
    if shipment is None:
        raise ValueError("Shipment not found")

    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        if shipment.company_id != company_id:
            raise PermissionError("Shipment does not belong to this company")

    _validate_cod_collection(db, shipment, payload, current_user=current_user)

    cod = db.query(COD).filter(COD.shipment_id == shipment.id, COD.is_deleted == False).first()
    if cod is None:
        cod = COD(
            shipment_id=shipment.id,
            company_id=shipment.company_id,
            amount=shipment.cod_amount or 0,
            currency="EGP",
            collected=True,
            collected_at=datetime.now(timezone.utc),
            notes="Collected via driver mobile or finance collection",
        )
        db.add(cod)
        db.commit()
        db.refresh(cod)
    else:
        cod.collected = True
        cod.collected_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(cod)

    if shipment.customer_id is None:
        raise ValueError("Shipment customer is required to record COD payment")

    payment_payload = normalize_payment_payload(SimpleNamespace(**payload))
    payment_payload.shipment_id = shipment.id
    payment_payload.cod_id = cod.id
    payment_payload.customer_id = shipment.customer_id
    payment_payload.currency = "EGP"
    payment_payload.payment_method = "Cash"
    payment_payload.payment_status = "Completed"
    payment_payload.transaction_reference = payload.get("transaction_reference") or f"COD-{shipment.id}-{int(datetime.now(timezone.utc).timestamp())}"
    payment_payload.paid_at = datetime.now(timezone.utc)
    payment_payload.notes = payload.get("notes") or "COD collection"
    payment_payload.amount = payload["amount_due"]

    validate_payment_method(payment_payload.payment_method)

    payment = Payment(
        shipment_id=shipment.id,
        cod_id=cod.id,
        customer_id=payment_payload.customer_id,
        company_id=shipment.company_id,
        amount=payment_payload.amount,
        currency=payment_payload.currency,
        payment_method=payment_payload.payment_method,
        payment_status=payment_payload.payment_status,
        transaction_reference=payment_payload.transaction_reference,
        paid_at=payment_payload.paid_at,
        notes=payment_payload.notes,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=shipment.company_id,
        action="collect",
        entity="cod",
        entity_id=cod.id,
        description=f"Collected COD for shipment {shipment.id} and created payment {payment.transaction_reference}",
    )

    return CodCollectionResponse(
        success=True,
        cod_id=cod.id,
        payment_id=payment.id,
        collected_at=cod.collected_at,
    )


def get_finance_summary(db: Session, current_user=None):
    _ensure_access(current_user, "report")

    payment_query = db.query(Payment).filter(Payment.is_deleted == False)
    cod_query = db.query(COD).filter(COD.is_deleted == False)
    shipment_query = db.query(Shipment).filter(Shipment.is_deleted == False, Shipment.cod_amount != None, Shipment.cod_amount > 0)

    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        payment_query = payment_query.filter(Payment.company_id == company_id)
        cod_query = cod_query.filter(COD.company_id == company_id)
        shipment_query = shipment_query.filter(Shipment.company_id == company_id)

    total_cod_due = float(shipment_query.with_entities(func.sum(Shipment.cod_amount)).scalar() or 0)
    total_cod_collected = float(cod_query.filter(COD.collected == True).with_entities(func.sum(COD.amount)).scalar() or 0)
    total_cod_pending = max(0.0, total_cod_due - total_cod_collected)
    total_payments_received = float(payment_query.with_entities(func.sum(Payment.amount)).scalar() or 0)
    outstanding_balance = max(0.0, total_cod_due - total_cod_collected)

    return {
        "total_cod_due": total_cod_due,
        "total_cod_collected": total_cod_collected,
        "total_cod_pending": total_cod_pending,
        "total_payments_received": total_payments_received,
        "outstanding_balance": outstanding_balance,
    }


def get_customer_ledger(db: Session, customer_id: int, current_user=None):
    _ensure_access(current_user, "read")

    company_id = _resolve_finance_company_id(current_user)

    customer = db.query(Customer).filter(Customer.id == customer_id)
    if company_id is not None:
        customer = customer.filter(Customer.company_id == company_id)
    customer = customer.first()
    if customer is None:
        raise ValueError("Customer not found")

    shipment_query = db.query(Shipment).filter(Shipment.customer_id == customer.id, Shipment.is_deleted == False)
    payment_query = db.query(Payment).filter(Payment.customer_id == customer.id, Payment.is_deleted == False)

    if company_id is not None:
        shipment_query = shipment_query.filter(Shipment.company_id == company_id)
        payment_query = payment_query.filter(Payment.company_id == company_id)

    shipments = [
        {
            "id": shipment.id,
            "tracking_number": shipment.tracking_number,
            "cod_amount": float(shipment.cod_amount or 0),
            "status": shipment.status,
            "created_at": shipment.created_at,
            "delivered_at": shipment.delivered_at,
        }
        for shipment in shipment_query.all()
    ]

    payments = [
        {
            "id": payment.id,
            "shipment_id": payment.shipment_id,
            "cod_id": payment.cod_id,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "transaction_reference": payment.transaction_reference,
            "paid_at": payment.paid_at,
            "created_at": payment.created_at,
            "notes": payment.notes,
        }
        for payment in payment_query.order_by(Payment.created_at.desc()).all()
    ]

    total_cod_due = sum(item["cod_amount"] for item in shipments)
    total_payments = sum(item["amount"] for item in payments)
    outstanding_balance = max(0.0, total_cod_due - total_payments)

    return {
        "customer_id": customer.id,
        "customer_name": customer.full_name,
        "total_cod_due": total_cod_due,
        "total_payments": total_payments,
        "outstanding_balance": outstanding_balance,
        "shipments": shipments,
        "payments": payments,
    }


def get_courier_settlement(db: Session, driver_id: int, current_user=None):
    _ensure_access(current_user, "settlement")

    company_id = _resolve_finance_company_id(current_user)

    driver = db.query(Driver).filter(Driver.id == driver_id)
    if company_id is not None:
        driver = driver.filter(Driver.company_id == company_id)
    driver = driver.first()
    if driver is None:
        raise ValueError("Driver not found")

    cod_query = db.query(COD).join(Shipment, COD.shipment_id == Shipment.id).filter(Shipment.assigned_to == driver.id, COD.is_deleted == False)
    if company_id is not None:
        cod_query = cod_query.filter(COD.company_id == company_id)

    total_collected = float(cod_query.filter(COD.collected == True).with_entities(func.sum(COD.amount)).scalar() or 0)
    total_pending = float(cod_query.filter(COD.collected == False).with_entities(func.sum(COD.amount)).scalar() or 0)

    settlements = [
        {
            "shipment_id": cod.shipment_id,
            "cod_amount": float(cod.amount),
            "collected": cod.collected,
            "collected_at": cod.collected_at,
            "customer_name": cod.shipment.customer.full_name if cod.shipment and cod.shipment.customer else None,
        }
        for cod in cod_query.all()
    ]

    return {
        "driver_id": driver.id,
        "driver_name": driver.full_name,
        "total_collected": total_collected,
        "total_pending": total_pending,
        "settlements": settlements,
    }


def get_finance_history(db: Session, current_user=None):
    _ensure_access(current_user, "report")

    payment_query = db.query(Payment).filter(Payment.is_deleted == False)
    cod_query = db.query(COD).filter(COD.is_deleted == False)

    company_id = _resolve_finance_company_id(current_user)
    if company_id is not None:
        payment_query = payment_query.filter(Payment.company_id == company_id)
        cod_query = cod_query.filter(COD.company_id == company_id)

    items = []
    for payment in payment_query.order_by(Payment.created_at.desc()).all():
        items.append({
            "id": payment.id,
            "type": "payment",
            "amount": float(payment.amount),
            "reference": payment.transaction_reference,
            "created_at": payment.created_at,
            "notes": payment.notes,
        })

    for cod in cod_query.order_by(COD.created_at.desc()).all():
        items.append({
            "id": cod.id,
            "type": "cod",
            "amount": float(cod.amount),
            "reference": f"COD-{cod.shipment_id}",
            "created_at": cod.created_at,
            "notes": cod.notes,
        })

    items.sort(key=lambda item: item["created_at"] or datetime.now(timezone.utc), reverse=True)
    return {"items": items[:50]}


def get_finance_reports(db: Session, current_user=None):
    _ensure_access(current_user, "report")

    summary = get_finance_summary(db, current_user=current_user)
    history = get_finance_history(db, current_user=current_user)
    return {
        "summary": summary,
        "history": history,
        "generated_at": datetime.now(timezone.utc),
    }
