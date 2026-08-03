import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.crud.finance import get_finance_summary
from app.database import Base
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.customer import Customer
from app.models.shipment import Shipment
from app.models.user import User
from main import app


def test_finance_summary_requires_company_context_for_tenant_user():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        tenant_user = User(username="tenant-finance", email="tenant-finance@example.com", hashed_password="x", role="company_admin")
        db.add(tenant_user)
        db.commit()
        db.refresh(tenant_user)

        with pytest.raises(PermissionError):
            get_finance_summary(db, current_user=tenant_user)
    finally:
        db.close()


def test_cod_collection_endpoint_creates_cod_and_payment():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        admin = User(username="finance-admin", email="finance-admin@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)

        customer = Customer(
            full_name="Customer One",
            phone="01234567890",
            email="customer@example.com",
            address="123 Finance St",
            city="Cairo",
            company_name="CourierCo",
            company_id=1,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        shipment = Shipment(
            sender_name="Alice",
            receiver_name="Bob",
            receiver_phone="12345678901",
            address="100 COD Lane",
            city="Cairo",
            status="Pending",
            owner_id=admin.id,
            company_id=1,
            customer_id=customer.id,
            estimated_delivery_days=2,
            notes="COD test shipment",
            cod_amount=150.0,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        def override_get_db():
            try:
                yield db
            finally:
                pass

        def override_get_current_user():
            return admin

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = override_get_current_user

        with TestClient(app) as client:
            response = client.post(
                f"/shipments/{shipment.id}/cod-collection",
                json={
                    "amount_due": 150.0,
                    "cash_tendered": 150.0,
                    "change_due": 0.0,
                },
            )

        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert isinstance(payload["cod_id"], int)
        assert isinstance(payload["payment_id"], int)
        assert payload["cod_id"] > 0
        assert payload["payment_id"] > 0

    finally:
        app.dependency_overrides.clear()
        db.close()


def test_finance_summary_and_history_endpoints_are_available():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        admin = User(username="finance-summary", email="finance-summary@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)

        customer = Customer(
            full_name="Summary Customer",
            phone="01111111111",
            email="summary@example.com",
            address="Summary St",
            city="Cairo",
            company_name="CourierCo",
            company_id=1,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        shipment = Shipment(
            sender_name="A",
            receiver_name="B",
            receiver_phone="12345678901",
            address="1 Summary St",
            city="Cairo",
            status="Pending",
            owner_id=admin.id,
            company_id=1,
            customer_id=customer.id,
            estimated_delivery_days=2,
            notes="",
            cod_amount=120.0,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        def override_get_db():
            try:
                yield db
            finally:
                pass

        def override_get_current_user():
            return admin

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = override_get_current_user

        with TestClient(app) as client:
            summary_response = client.get("/finance/summary")
            history_response = client.get("/finance/history")
            reports_response = client.get("/finance/reports")

        assert summary_response.status_code == 200
        assert history_response.status_code == 200
        assert reports_response.status_code == 200

        summary_payload = summary_response.json()
        assert summary_payload["total_cod_due"] == 120.0
        assert summary_payload["total_cod_collected"] == 0.0
        assert summary_payload["total_cod_pending"] == 120.0
        assert summary_payload["outstanding_balance"] == 120.0
        assert summary_payload["total_payments_received"] == 0.0

        assert "items" in history_response.json()
        assert "summary" in reports_response.json()
    finally:
        app.dependency_overrides.clear()
        db.close()
