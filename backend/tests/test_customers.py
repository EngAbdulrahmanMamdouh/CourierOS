from types import SimpleNamespace

import pytest

from app.crud import customer as customer_crud
from app.database import Base, SessionLocal, engine
from app.routers.customers import create_customer as create_customer_route
from app.routers.customers import delete_customer as delete_customer_route
from app.routers.customers import get_customer as get_customer_route
from app.routers.customers import get_customers as get_customers_route
from app.routers.customers import update_customer as update_customer_route


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_customer_crud_search_and_permissions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=None)
        company_admin = SimpleNamespace(id=2, role="company_admin", company_id=1)
        employee = SimpleNamespace(id=3, role="employee", company_id=1)
        regular_user = SimpleNamespace(id=4, role="user", company_id=1)

        created = customer_crud.create_customer(
            db=db,
            customer_data=SimpleNamespace(
                full_name="Alice Johnson",
                phone="1234567890",
                email="alice@example.com",
                company_name="Acme Co",
                address="1 Main St",
                city="Cairo",
                notes="VIP",
                is_active=True,
            ),
            current_user=admin,
        )
        assert created.full_name == "Alice Johnson"

        customer_crud.create_customer(
            db=db,
            customer_data=SimpleNamespace(
                full_name="Bob Smith",
                phone="0987654321",
                email="bob@example.com",
                company_name="Beta LLC",
                address="2 Main St",
                city="Alex",
                notes="",
                is_active=True,
            ),
            current_user=company_admin,
        )

        page_one = customer_crud.get_all_customers(db=db, page=1, size=1, current_user=admin)
        assert len(page_one) == 1

        search_results = customer_crud.get_all_customers(db=db, page=1, size=10, search="Acme", current_user=admin)
        assert len(search_results) == 1

        customer = customer_crud.get_customer_by_id(db=db, customer_id=created.id, current_user=employee)
        assert customer is not None
        assert customer.phone == "1234567890"

        updated = customer_crud.update_customer(
            db=db,
            customer_id=created.id,
            customer_data=SimpleNamespace(
                full_name="Alice Updated",
                phone="1234567890",
                email="alice@example.com",
                company_name="Acme Co",
                address="1 Main St",
                city="Cairo",
                notes="Updated",
                is_active=True,
            ),
            current_user=company_admin,
        )
        assert updated.full_name == "Alice Updated"

        with pytest.raises(PermissionError):
            customer_crud.create_customer(
                db=db,
                customer_data=SimpleNamespace(
                    full_name="No Access",
                    phone="5555555555",
                    email="x@example.com",
                    company_name="",
                    address="",
                    city="",
                    notes="",
                    is_active=True,
                ),
                current_user=regular_user,
            )

        deleted = customer_crud.delete_customer(db=db, customer_id=created.id, current_user=admin)
        assert deleted is not None
    finally:
        db.close()
