from datetime import datetime
from types import SimpleNamespace

import pytest

from app.crud import pickup_request as pickup_request_crud
from app.database import Base, SessionLocal, engine
from app.models.customer import Customer
from app.models.city import City
from app.models.branch import Branch
from app.models.driver import Driver


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_pickup_request_crud_and_status_transitions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=None)
        employee = SimpleNamespace(id=2, role="employee", company_id=1)
        user = SimpleNamespace(id=3, role="user", company_id=1)

        customer = Customer(
            full_name="Test Customer",
            phone="01234567890",
            email="test@example.com",
            company_name="Test Co",
            address="1 Test St",
            city="Cairo",
            notes="",
            company_id=1,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        city = City(name="Cairo", code="CAI", governorate="Cairo", is_active=True)
        db.add(city)
        db.commit()
        db.refresh(city)

        branch = Branch(name="Main Branch", code="MB", address="1 Branch St", city="Cairo", phone="0123456789", manager_id=None, company_id=1)
        db.add(branch)
        db.commit()
        db.refresh(branch)

        driver = Driver(
            full_name="Test Driver",
            phone="01234567891",
            national_id="12345678901234",
            license_number="L12345",
            vehicle_type="Van",
            vehicle_plate="ABC123",
            branch_id=branch.id,
            company_id=1,
        )
        db.add(driver)
        db.commit()
        db.refresh(driver)

        created = pickup_request_crud.create_pickup_request(
            db=db,
            request_data=SimpleNamespace(
                customer_id=customer.id,
                pickup_address="123 Pickup St",
                city_id=city.id,
                contact_name="Parker",
                contact_phone="01234567892",
                preferred_pickup_date=datetime.fromisoformat("2026-07-03T10:00:00"),
                preferred_time_window="09:00-11:00",
                notes="Handle with care",
                assigned_branch_id=branch.id,
                assigned_driver_id=driver.id,
            ),
            current_user=user,
        )

        assert created.id is not None
        assert created.status == "Pending"

        lookup = pickup_request_crud.get_pickup_request_by_id(db, created.id, current_user=user)
        assert lookup is not None
        assert lookup.customer_id == customer.id

        updated = pickup_request_crud.update_pickup_request(
            db=db,
            request_id=created.id,
            request_data=SimpleNamespace(
                customer_id=customer.id,
                pickup_address="124 Pickup St",
                city_id=city.id,
                contact_name="Parker",
                contact_phone="01234567892",
                preferred_pickup_date=datetime.fromisoformat("2026-07-03T11:00:00"),
                preferred_time_window="11:00-13:00",
                notes="Updated notes",
                assigned_branch_id=branch.id,
                assigned_driver_id=driver.id,
            ),
            current_user=employee,
        )
        assert updated.pickup_address == "124 Pickup St"

        with pytest.raises(ValueError):
            pickup_request_crud.change_pickup_request_status(
                db=db,
                request_id=created.id,
                new_status="Assigned",
                current_user=employee,
            )

        approved = pickup_request_crud.change_pickup_request_status(
            db=db,
            request_id=created.id,
            new_status="Approved",
            current_user=admin,
        )
        assert approved.status == "Approved"

        assigned = pickup_request_crud.change_pickup_request_status(
            db=db,
            request_id=created.id,
            new_status="Assigned",
            current_user=admin,
        )
        assert assigned.status == "Assigned"

        picked_up = pickup_request_crud.change_pickup_request_status(
            db=db,
            request_id=created.id,
            new_status="Picked Up",
            current_user=admin,
        )
        assert picked_up.status == "Picked Up"

        deleted = pickup_request_crud.delete_pickup_request(db=db, request_id=created.id, current_user=admin)
        assert deleted.is_deleted is True
    finally:
        db.close()
