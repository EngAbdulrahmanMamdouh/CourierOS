from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.city import City
from app.models.delivery_zone import DeliveryZone
from app.schemas.city import CityCreate, CityUpdate
from app.services.audit_service import create_audit_log
from app.services.permissions import require_permission


def _ensure_access(current_user, action: str):
    if action == "view":
        allowed = {"view", "read"}
    else:
        allowed = {"create", "update", "delete"}

    return require_permission(current_user, action, allowed)


def get_all_cities(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(City).filter(City.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(
                (City.company_id == company_id) | (City.company_id.is_(None))
            )
    if search:
        search_value = f"%{search}%"
        query = query.filter((City.name.ilike(search_value)) | (City.code.ilike(search_value)) | (City.governorate.ilike(search_value)))
    return query.order_by(City.id.desc()).offset(offset).limit(size).all()


def get_city_by_id(db: Session, city_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(City).filter(City.id == city_id, City.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(
            (City.company_id == company_id) | (City.company_id.is_(None))
        )
    return query.first()


def create_city(db: Session, city_data: CityCreate, current_user=None):
    _ensure_access(current_user, "create")
    company_id = getattr(current_user, "company_id", None)
    if current_user.role != "admin" and company_id is None:
        raise PermissionError("Company context required")
    city = City(
        name=city_data.name,
        code=city_data.code,
        governorate=city_data.governorate,
        company_id=company_id,
        is_active=city_data.is_active,
    )
    db.add(city)
    db.commit()
    db.refresh(city)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="create",
        entity="city",
        entity_id=city.id,
        description=f"Created city {city.name}",
    )
    return city


def update_city(db: Session, city_id: int, city_data: CityUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(City).filter(City.id == city_id, City.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(
            (City.company_id == company_id) | (City.company_id.is_(None))
        )
    city = query.first()
    if city is None:
        return None
    city.name = city_data.name
    city.code = city_data.code
    city.governorate = city_data.governorate
    city.is_active = city_data.is_active
    db.commit()
    db.refresh(city)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="update",
        entity="city",
        entity_id=city.id,
        description=f"Updated city {city.name}",
    )
    return city


def delete_city(db: Session, city_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(City).filter(City.id == city_id, City.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required")
        query = query.filter(
            (City.company_id == company_id) | (City.company_id.is_(None))
        )
    city = query.first()
    if city is None:
        return None
    city.is_deleted = True
    city.deleted_at = datetime.now(timezone.utc)

    zones = db.query(DeliveryZone).filter(DeliveryZone.city_id == city.id, DeliveryZone.is_deleted == False).all()
    for zone in zones:
        zone.is_deleted = True
        zone.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(city)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="city",
        entity_id=city.id,
        description=f"Soft deleted city {city.name}",
    )
    return city
