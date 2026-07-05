from types import SimpleNamespace

import pytest

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.user import User
from app.routers.company import router as company_router
from app.dependencies.auth import get_current_user
from fastapi import FastAPI
from fastapi.testclient import TestClient


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(company_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def test_company_crud_admin_access():
    db = SessionLocal()
    try:
        admin = User(username="admin", email="admin@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)

        client = _create_test_app(admin)

        response = client.post(
            "/companies/",
            json={
                "name": "Acme Logistics",
                "code": "ACME",
                "email": "contact@acme.com",
                "phone": "01234567890",
                "address": "1 Logistics Way",
                "city": "Cairo",
                "country": "Egypt",
                "tax_number": "12345",
                "commercial_register": "CR-001",
                "logo_url": "https://example.com/logo.png",
                "subscription_plan": "enterprise",
                "subscription_status": "active",
                "is_active": True,
            },
        )
        assert response.status_code == 200
        created = response.json()
        assert created["code"] == "ACME"

        company_id = created["id"]
        get_response = client.get(f"/companies/{company_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == "Acme Logistics"

        update_response = client.put(
            f"/companies/{company_id}",
            json={
                "name": "Acme Logistics Updated",
                "code": "ACME",
                "email": "contact@acme.com",
                "phone": "01234567890",
                "address": "1 Logistics Way",
                "city": "Cairo",
                "country": "Egypt",
                "tax_number": "12345",
                "commercial_register": "CR-001",
                "logo_url": "https://example.com/logo.png",
                "subscription_plan": "enterprise",
                "subscription_status": "active",
                "is_active": True,
            },
        )
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Acme Logistics Updated"

        delete_response = client.delete(f"/companies/{company_id}")
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Company deleted successfully"
    finally:
        db.close()


def test_company_admin_read_own_company():
    db = SessionLocal()
    try:
        company = Company(
            name="LogiCo",
            code="LOGI",
            email="info@logico.com",
            phone="01234567891",
            address="2 Delivery Ave",
            city="Alexandria",
            country="Egypt",
            tax_number="67890",
            commercial_register="CR-002",
            logo_url="",
            subscription_plan="standard",
            subscription_status="active",
            is_active=True,
        )
        db.add(company)
        db.commit()
        db.refresh(company)

        company_admin = User(username="company-admin", email="admin2@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(company_admin)
        db.commit()
        db.refresh(company_admin)

        client = _create_test_app(company_admin)
        response = client.get(f"/companies/{company.id}")
        assert response.status_code == 200
        assert response.json()["code"] == "LOGI"

        unauthorized_response = client.get(f"/companies/{company.id + 1}")
        assert unauthorized_response.status_code == 403
    finally:
        db.close()


def test_company_employee_no_access():
    db = SessionLocal()
    try:
        employee = User(username="employee", email="employee@example.com", hashed_password="x", role="employee")
        db.add(employee)
        db.commit()
        db.refresh(employee)

        client = _create_test_app(employee)
        response = client.get("/companies/")
        assert response.status_code == 403
    finally:
        db.close()
