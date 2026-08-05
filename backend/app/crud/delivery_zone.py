from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.city import City
from app.models.delivery_zone import DeliveryZone
from app.schemas.delivery_zone import DeliveryZoneCreate, DeliveryZoneUpdate
from app.services.audit_service import create_audit_log
from app.services.permissions import require_permission
from app.services.tenant_context import is_platform_admin, require_write_company_id, require_company_context


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "read"})


def get_all_delivery_zones(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(DeliveryZone).join(City).filter(DeliveryZone.is_deleted == False, City.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(DeliveryZone.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(DeliveryZone.zone_name.ilike(search_value))
    return query.order_by(DeliveryZone.id.desc()).offset(offset).limit(size).all()


def get_delivery_zone_by_id(db: Session, zone_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(DeliveryZone).join(City).filter(DeliveryZone.id == zone_id, DeliveryZone.is_deleted == False, City.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(DeliveryZone.company_id == company_id)
    return query.first()


def create_delivery_zone(db: Session, zone_data: DeliveryZoneCreate, current_user=None):
    _ensure_access(current_user, "create")
    if not is_platform_admin(current_user) and getattr(current_user, "company_id", None) is None:
        raise PermissionError("Company context required")

    if is_platform_admin(current_user):
        company_id = getattr(zone_data, "company_id", None)
        if company_id is None:
            company_id = getattr(current_user, "company_id", None)
    else:
        company_id = require_write_company_id(current_user, getattr(zone_data, "company_id", None))
        if company_id is None:
            raise PermissionError("Company context required for this operation")

    city = db.query(City).filter(City.id == zone_data.city_id)
    if company_id is not None:
        city = city.filter((City.company_id == company_id) | (City.company_id.is_(None)))
    if city.first() is None:
        raise ValueError(f"City {zone_data.city_id} does not belong to this company")

    zone = DeliveryZone(
        city_id=zone_data.city_id,
        company_id=company_id,
        zone_name=zone_data.zone_name,
        delivery_days=zone_data.delivery_days,
        extra_cost=zone_data.extra_cost,
        is_active=zone_data.is_active,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="create",
        entity="delivery_zone",
        entity_id=zone.id,
        description=f"Created delivery zone {zone.zone_name}",
    )
    return zone


def update_delivery_zone(db: Session, zone_id: int, zone_data: DeliveryZoneUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id, DeliveryZone.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(DeliveryZone.company_id == company_id)
    zone = query.first()
    if zone is None:
        return None

    city_query = db.query(City).filter(City.id == zone_data.city_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        city_query = city_query.filter((City.company_id == company_id) | (City.company_id.is_(None)))
    if city_query.first() is None:
        raise ValueError(f"City {zone_data.city_id} does not belong to this company")

    zone.city_id = zone_data.city_id
    zone.zone_name = zone_data.zone_name
    zone.delivery_days = zone_data.delivery_days
    zone.extra_cost = zone_data.extra_cost
    zone.is_active = zone_data.is_active
    db.commit()
    db.refresh(zone)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="update",
        entity="delivery_zone",
        entity_id=zone.id,
        description=f"Updated delivery zone {zone.zone_name}",
    )
    return zone


def delete_delivery_zone(db: Session, zone_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id, DeliveryZone.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(DeliveryZone.company_id == company_id)
    zone = query.first()
    if zone is None:
        return None
    zone.is_deleted = True
    zone.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(zone)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="delivery_zone",
        entity_id=zone.id,
        description=f"Soft deleted delivery zone {zone.zone_name}",
    )
    return zone
