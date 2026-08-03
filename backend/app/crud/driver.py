from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate
from app.services.permissions import require_permission
from app.services.tenant_context import get_current_company_id, is_platform_admin, require_company_context


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "create", "update"})


def get_all_drivers(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(Driver)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Driver.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            (Driver.full_name.ilike(search_value)) |
            (Driver.phone.ilike(search_value)) |
            (Driver.license_number.ilike(search_value))
        )
    return query.order_by(Driver.id.desc()).offset(offset).limit(size).all()


def get_driver_by_id(db: Session, driver_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(Driver).filter(Driver.id == driver_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Driver.company_id == company_id)
    return query.first()


def create_driver(db: Session, driver_data: DriverCreate, current_user=None):
    _ensure_access(current_user, "create")
    company_id = require_company_context(current_user) if not is_platform_admin(current_user) else None
    status = getattr(driver_data, "status", "Active")
    driver = Driver(
        full_name=getattr(driver_data, "full_name", ""),
        employee_code=getattr(driver_data, "employee_code", None),
        national_id=getattr(driver_data, "national_id", ""),
        phone=getattr(driver_data, "phone", ""),
        email=getattr(driver_data, "email", None),
        license_number=getattr(driver_data, "license_number", ""),
        vehicle_type=getattr(driver_data, "vehicle_type", ""),
        vehicle_plate=getattr(driver_data, "vehicle_plate", ""),
        license_expiry=getattr(driver_data, "license_expiry", None),
        status=status,
        availability=getattr(driver_data, "availability", "Available"),
        branch_id=getattr(driver_data, "branch_id", None),
        company_id=company_id,
        is_active=getattr(driver_data, "is_active", status == "Active"),
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update_driver(db: Session, driver_id: int, driver_data: DriverUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Driver).filter(Driver.id == driver_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Driver.company_id == company_id)
    driver = query.first()
    if driver is None:
        return None
    status = getattr(driver_data, "status", driver.status)
    driver.full_name = getattr(driver_data, "full_name", driver.full_name)
    driver.employee_code = getattr(driver_data, "employee_code", driver.employee_code)
    driver.phone = getattr(driver_data, "phone", driver.phone)
    driver.email = getattr(driver_data, "email", driver.email)
    driver.national_id = getattr(driver_data, "national_id", driver.national_id)
    driver.license_number = getattr(driver_data, "license_number", driver.license_number)
    driver.vehicle_type = getattr(driver_data, "vehicle_type", driver.vehicle_type)
    driver.vehicle_plate = getattr(driver_data, "vehicle_plate", driver.vehicle_plate)
    driver.license_expiry = getattr(driver_data, "license_expiry", driver.license_expiry)
    driver.status = status
    driver.availability = getattr(driver_data, "availability", driver.availability)
    driver.branch_id = getattr(driver_data, "branch_id", driver.branch_id)
    driver.is_active = getattr(driver_data, "is_active", status == "Active")
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Driver).filter(Driver.id == driver_id)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(Driver.company_id == company_id)
    driver = query.first()
    if driver is None:
        return None
    db.delete(driver)
    db.commit()
    return driver
