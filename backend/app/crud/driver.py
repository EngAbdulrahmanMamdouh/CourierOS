from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate
from app.services.permissions import require_permission


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "create", "update"})


def get_all_drivers(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(Driver)
    if current_user.role != "admin":
        query = query.filter(Driver.company_id == current_user.company_id)
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
    if current_user.role != "admin":
        query = query.filter(Driver.company_id == current_user.company_id)
    return query.first()


def create_driver(db: Session, driver_data: DriverCreate, current_user=None):
    _ensure_access(current_user, "create")
    if current_user.role != "admin" and current_user.company_id is None:
        raise PermissionError("Company context required")
    driver = Driver(
        full_name=driver_data.full_name,
        phone=driver_data.phone,
        national_id=driver_data.national_id,
        license_number=driver_data.license_number,
        vehicle_type=driver_data.vehicle_type,
        vehicle_plate=driver_data.vehicle_plate,
        branch_id=driver_data.branch_id,
        company_id=current_user.company_id or 1,
        is_active=driver_data.is_active,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update_driver(db: Session, driver_id: int, driver_data: DriverUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Driver).filter(Driver.id == driver_id)
    if current_user.role != "admin":
        query = query.filter(Driver.company_id == current_user.company_id)
    driver = query.first()
    if driver is None:
        return None
    driver.full_name = driver_data.full_name
    driver.phone = driver_data.phone
    driver.national_id = driver_data.national_id
    driver.license_number = driver_data.license_number
    driver.vehicle_type = driver_data.vehicle_type
    driver.vehicle_plate = driver_data.vehicle_plate
    driver.branch_id = driver_data.branch_id
    driver.is_active = driver_data.is_active
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Driver).filter(Driver.id == driver_id)
    if current_user.role != "admin":
        query = query.filter(Driver.company_id == current_user.company_id)
    driver = query.first()
    if driver is None:
        return None
    db.delete(driver)
    db.commit()
    return driver
