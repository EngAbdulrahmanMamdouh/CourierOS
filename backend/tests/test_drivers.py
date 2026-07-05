from types import SimpleNamespace

import pytest

from app.crud import driver as driver_crud
from app.database import Base, SessionLocal, engine


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_driver_crud_search_pagination_and_permissions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=None)
        employee = SimpleNamespace(id=2, role="employee", company_id=1)
        regular_user = SimpleNamespace(id=3, role="user", company_id=1)

        created = driver_crud.create_driver(
            db=db,
            driver_data=SimpleNamespace(
                full_name="Ahmed Ali",
                phone="01011111111",
                national_id="12345678901234",
                license_number="LIC-001",
                vehicle_type="Bike",
                vehicle_plate="ABC-1234",
                branch_id=None,
                is_active=True,
            ),
            current_user=admin,
        )
        assert created.full_name == "Ahmed Ali"

        driver_crud.create_driver(
            db=db,
            driver_data=SimpleNamespace(
                full_name="Samir Hassan",
                phone="01022222222",
                national_id="12345678901235",
                license_number="LIC-002",
                vehicle_type="Car",
                vehicle_plate="XYZ-5678",
                branch_id=None,
                is_active=True,
            ),
            current_user=admin,
        )

        page_one = driver_crud.get_all_drivers(db=db, page=1, size=1, current_user=employee)
        assert len(page_one) == 1

        search_results = driver_crud.get_all_drivers(db=db, page=1, size=10, search="Samir", current_user=employee)
        assert len(search_results) == 1

        driver = driver_crud.get_driver_by_id(db=db, driver_id=created.id, current_user=employee)
        assert driver is not None
        assert driver.phone == "01011111111"

        updated = driver_crud.update_driver(
            db=db,
            driver_id=created.id,
            driver_data=SimpleNamespace(
                full_name="Ahmed Ali Updated",
                phone="01011111111",
                national_id="12345678901234",
                license_number="LIC-001",
                vehicle_type="Bike",
                vehicle_plate="ABC-1234",
                branch_id=None,
                is_active=True,
            ),
            current_user=admin,
        )
        assert updated.full_name == "Ahmed Ali Updated"

        with pytest.raises(PermissionError):
            driver_crud.create_driver(
                db=db,
                driver_data=SimpleNamespace(
                    full_name="Blocked Driver",
                    phone="01033333333",
                    national_id="12345678901236",
                    license_number="LIC-003",
                    vehicle_type="Truck",
                    vehicle_plate="ZZZ-9999",
                    branch_id=None,
                    is_active=True,
                ),
                current_user=regular_user,
            )

        deleted = driver_crud.delete_driver(db=db, driver_id=created.id, current_user=admin)
        assert deleted is not None
    finally:
        db.close()
