from types import SimpleNamespace

import pytest

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.user import User
from app.routers.company_settings import router as settings_router
from app.dependencies.auth import get_current_user
from fastapi import FastAPI
from fastapi.testclient import TestClient


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(settings_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _settings_payload(company_id: int):
    return {
        "company_id": company_id,
        "company_name": "Acme Logistics",
        "company_logo": "https://example.com/logo.png",
        "currency": "USD",
        "timezone": "Africa/Cairo",
        "language": "en",
        "shipment_prefix": "ACME-SHIP",
        "invoice_prefix": "ACME-INV",
        "barcode_prefix": "ACME-BAR",
        "default_cod_percentage": 10,
        "default_tax_percentage": 15,
        "sms_provider": "twilio",
        "email_provider": "mailgun",
        "whatsapp_provider": "whatsapp-business",
        "default_shipment_status": "pending",
        "support_email": "support@acme.com",
        "support_phone": "+201234567890",
        "website": "https://acme.com",
        "is_active": True,
    }


def test_admin_can_manage_any_company_settings():
    db = SessionLocal()
    try:
        company = Company(name="Acme", code="ACME", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        admin = User(username="admin", email="admin@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)

        client = _create_test_app(admin)
        payload = _settings_payload(company.id)

        create_response = client.post("/company-settings/", json=payload)
        assert create_response.status_code == 200
        assert create_response.json()["company_id"] == company.id

        get_response = client.get(f"/company-settings/{company.id}")
        assert get_response.status_code == 200
        assert get_response.json()["company_name"] == "Acme Logistics"

        payload["company_name"] = "Acme Logistics Updated"
        update_response = client.put(f"/company-settings/{company.id}", json=payload)
        assert update_response.status_code == 200
        assert update_response.json()["company_name"] == "Acme Logistics Updated"
    finally:
        db.close()


def test_company_admin_can_manage_own_company_settings_only():
    db = SessionLocal()
    try:
        company = Company(name="Acme", code="ACME", is_active=True)
        another_company = Company(name="Other", code="OTHER", is_active=True)
        db.add_all([company, another_company])
        db.commit()
        db.refresh(company)
        db.refresh(another_company)

        company_admin = User(username="companyadmin", email="admin2@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(company_admin)
        db.commit()
        db.refresh(company_admin)

        client = _create_test_app(company_admin)
        payload = _settings_payload(company.id)

        create_response = client.post("/company-settings/", json=payload)
        assert create_response.status_code == 200

        get_response = client.get(f"/company-settings/{company.id}")
        assert get_response.status_code == 200

        unauthorized_response = client.get(f"/company-settings/{another_company.id}")
        assert unauthorized_response.status_code == 403

        payload["company_name"] = "Updated"
        update_response = client.put(f"/company-settings/{company.id}", json=payload)
        assert update_response.status_code == 200

        payload["company_id"] = another_company.id
        invalid_update = client.put(f"/company-settings/{another_company.id}", json=payload)
        assert invalid_update.status_code == 403
    finally:
        db.close()


def test_employee_can_read_only():
    db = SessionLocal()
    try:
        company = Company(name="Acme", code="ACME", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        settings_user = User(username="employee", email="employee@example.com", hashed_password="x", role="employee", company_id=company.id)
        db.add(settings_user)
        db.commit()
        db.refresh(settings_user)

        settings_payload = _settings_payload(company.id)
        settings_payload["company_name"] = "Acme Settings"

        employee_client = _create_test_app(settings_user)

        create_response = employee_client.post("/company-settings/", json=settings_payload)
        assert create_response.status_code == 403

        admin = User(username="admin2", email="admin2@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)
        admin_client = _create_test_app(admin)
        admin_client.post("/company-settings/", json=_settings_payload(company.id))

        get_response = employee_client.get(f"/company-settings/{company.id}")
        assert get_response.status_code == 200

        update_response = employee_client.put(f"/company-settings/{company.id}", json=_settings_payload(company.id))
        assert update_response.status_code == 403
    finally:
        db.close()
