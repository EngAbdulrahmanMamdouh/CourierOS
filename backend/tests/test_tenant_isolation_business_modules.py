from types import SimpleNamespace
import time

import pytest

from app.database import Base, SessionLocal, engine
from app.models.branch import Branch
from app.models.company import Company
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.user import User
from app.routers.branches import router as branch_router
from app.routers.customers import router as customer_router
from app.routers.drivers import router as driver_router
from app.dependencies.auth import get_current_user
from fastapi import FastAPI
from fastapi.testclient import TestClient


_counter = 0


def setup_function():
    global _counter
    _counter = 0
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _get_unique_id():
    global _counter
    _counter += 1
    return _counter


def _create_test_app(user):
    app = FastAPI()
    app.include_router(customer_router)
    app.include_router(branch_router)
    app.include_router(driver_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _customer_payload():
    uid = _get_unique_id()
    return {
        "full_name": f"Customer {uid}",
        "phone": f"0123456789{uid}",
        "email": f"customer{uid}@example.com",
        "company_name": "Acme Logistics",
        "address": "1 Logistics Way",
        "city": "Cairo",
        "notes": "VIP",
        "is_active": True,
    }


def _branch_payload():
    uid = _get_unique_id()
    return {
        "name": f"Branch {uid}",
        "code": f"BR{uid:03d}",
        "address": "1 Branch Road",
        "city": "Cairo",
        "phone": "01234567890",
        "manager_id": None,
        "is_active": True,
    }


def _driver_payload():
    uid = _get_unique_id()
    return {
        "full_name": f"Driver {uid}",
        "phone": f"0111111111{uid}",
        "national_id": f"123456789{uid}",
        "license_number": f"LIC{uid:03d}",
        "vehicle_type": "Van",
        "vehicle_plate": f"ABC{uid:03d}",
        "branch_id": None,
        "is_active": True,
    }


def test_company_admin_and_employee_are_restricted_to_their_company():
    db = SessionLocal()
    try:
        company1 = Company(name="Acme", code="ACME", is_active=True)
        company2 = Company(name="Other", code="OTHER", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        admin = User(username="admin", email="admin@example.com", hashed_password="x", role="admin", company_id=company2.id)
        company_admin = User(username="companyadmin", email="ca@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        employee = User(username="employee", email="employee@example.com", hashed_password="x", role="employee", company_id=company1.id)
        db.add_all([admin, company_admin, employee])
        db.commit()
        db.refresh(admin)
        db.refresh(company_admin)
        db.refresh(employee)

        # Admin can create for their company.
        admin_client = _create_test_app(admin)
        payload = _customer_payload()
        customer_response = admin_client.post("/customers/", json=payload)
        assert customer_response.status_code == 200
        customer_id = customer_response.json()["id"]

        branch_response = admin_client.post("/branches/", json=_branch_payload())
        assert branch_response.status_code == 200
        branch_id = branch_response.json()["id"]

        driver_payload = _driver_payload()
        driver_payload["branch_id"] = branch_id
        driver_response = admin_client.post("/drivers/", json=driver_payload)
        assert driver_response.status_code == 200
        driver_id = driver_response.json()["id"]

        # Company admin from company1 cannot see company2 data.
        company_admin_client = _create_test_app(company_admin)
        response = company_admin_client.get(f"/customers/{customer_id}")
        assert response.status_code == 404
        response = company_admin_client.get(f"/branches/{branch_id}")
        assert response.status_code == 404
        response = company_admin_client.get(f"/drivers/{driver_id}")
        assert response.status_code == 404

        # Create own company data for company_admin.
        payload2 = _customer_payload()
        payload2["full_name"] = "Company1 Customer"
        create_response = company_admin_client.post("/customers/", json=payload2)
        assert create_response.status_code == 200

        branch2 = _branch_payload()
        branch2["code"] = "COMP1"
        branch_create = company_admin_client.post("/branches/", json=branch2)
        assert branch_create.status_code == 200

        driver2 = _driver_payload()
        driver2["phone"] = "01111111112"
        driver_create = company_admin_client.post("/drivers/", json=driver2)
        assert driver_create.status_code == 200

        # Employee can only read own company and cannot create.
        employee_client = _create_test_app(employee)
        read_response = employee_client.get("/customers/")
        assert read_response.status_code == 200
        assert isinstance(read_response.json(), list)

        create_response = employee_client.post("/customers/", json=_customer_payload())
        assert create_response.status_code == 403
    finally:
        db.close()
