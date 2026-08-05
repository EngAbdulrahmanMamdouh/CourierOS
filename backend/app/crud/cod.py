from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.cod import COD
from app.models.shipment import Shipment
from app.schemas.cod import CODCreate, CODUpdate
from app.services.audit_service import create_audit_log
from app.services.cod_service import normalize_cod_payload
from app.services.permissions import require_permission
from app.services.tenant_context import is_platform_admin, require_write_company_id, require_company_context


def _ensure_access(current_user, action: str):
    allowed = {"view", "read", "collect"} if action == "collect" else {"view", "read", "create", "update", "delete"}
    return require_permission(current_user, action, allowed)


def _validate_cod(payload, existing_cod=None):
    if float(payload.amount) < 0:
        raise ValueError("COD amount cannot be negative")

    if payload.collected and payload.collected_at is None:
        raise ValueError("Collection timestamp is required when collected is true")

    if payload.transferred_to_customer and payload.transferred_at is None:
        raise ValueError("Transfer timestamp is required when transferred is true")

    if payload.transferred_to_customer and not payload.collected:
        raise ValueError("COD cannot be transferred before it is collected")

    return True


def get_all_cods(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(COD).filter(COD.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(COD.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(COD.currency.ilike(search_value))
    return query.order_by(COD.id.desc()).offset(offset).limit(size).all()


def get_cod_by_id(db: Session, cod_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(COD).filter(COD.id == cod_id, COD.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(COD.company_id == company_id)
    return query.first()


def create_cod(db: Session, cod_data: CODCreate, current_user=None):
    _ensure_access(current_user, "create")
    cod_data = normalize_cod_payload(cod_data)
    if not is_platform_admin(current_user) and getattr(current_user, "company_id", None) is None:
        raise PermissionError("Company context required")
    _validate_cod(cod_data)

    if is_platform_admin(current_user):
        company_id = getattr(cod_data, "company_id", None)
        if company_id is None:
            company_id = getattr(current_user, "company_id", None)
    else:
        company_id = require_write_company_id(current_user, getattr(cod_data, "company_id", None))

    existing = db.query(COD).filter(COD.shipment_id == cod_data.shipment_id, COD.is_deleted == False)
    if company_id is not None:
        existing = existing.filter(COD.company_id == company_id)
    if existing.first() is not None:
        raise ValueError("A shipment can have only one COD record")
    shipment = db.query(Shipment).filter(Shipment.id == cod_data.shipment_id)
    if company_id is not None:
        shipment = shipment.filter(Shipment.company_id == company_id)
    if shipment.first() is None:
        raise ValueError(f"Shipment {cod_data.shipment_id} does not belong to this company")

    cod = COD(
        shipment_id=cod_data.shipment_id,
        company_id=company_id,
        amount=cod_data.amount,
        currency=cod_data.currency,
        collected=cod_data.collected,
        collected_at=cod_data.collected_at,
        collected_by_driver_id=cod_data.collected_by_driver_id,
        transferred_to_customer=cod_data.transferred_to_customer,
        transferred_at=cod_data.transferred_at,
        notes=cod_data.notes,
    )
    db.add(cod)
    db.commit()
    db.refresh(cod)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="create",
        entity="cod",
        entity_id=cod.id,
        description=f"Created COD for shipment {cod.shipment_id}",
    )
    return cod


def update_cod(db: Session, cod_id: int, cod_data: CODUpdate, current_user=None):
    _ensure_access(current_user, "update")
    cod_data = normalize_cod_payload(cod_data)
    query = db.query(COD).filter(COD.id == cod_id, COD.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(COD.company_id == company_id)
    cod = query.first()
    if cod is None:
        return None

    _validate_cod(cod_data)

    if is_platform_admin(current_user):
        company_id = getattr(cod_data, "company_id", None)
        if company_id is None:
            company_id = getattr(cod.id, "company_id", None)
    else:
        company_id = require_write_company_id(current_user, getattr(cod_data, "company_id", None))
    shipment = db.query(Shipment).filter(Shipment.id == cod_data.shipment_id)
    if company_id is not None:
        shipment = shipment.filter(Shipment.company_id == company_id)
    if shipment.first() is None:
        raise ValueError(f"Shipment {cod_data.shipment_id} does not belong to this company")

    cod.shipment_id = cod_data.shipment_id
    cod.company_id = company_id
    cod.amount = cod_data.amount
    cod.currency = cod_data.currency
    cod.collected = cod_data.collected
    cod.collected_at = cod_data.collected_at
    cod.collected_by_driver_id = cod_data.collected_by_driver_id
    cod.transferred_to_customer = cod_data.transferred_to_customer
    cod.transferred_at = cod_data.transferred_at
    cod.notes = cod_data.notes
    db.commit()
    db.refresh(cod)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="update",
        entity="cod",
        entity_id=cod.id,
        description=f"Updated COD for shipment {cod.shipment_id}",
    )
    return cod


def delete_cod(db: Session, cod_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(COD).filter(COD.id == cod_id, COD.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(COD.company_id == company_id)
    cod = query.first()
    if cod is None:
        return None
    cod.is_deleted = True
    cod.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cod)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="cod",
        entity_id=cod.id,
        description=f"Soft deleted COD for shipment {cod.shipment_id}",
    )
    return cod
