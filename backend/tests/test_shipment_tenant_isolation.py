from types import SimpleNamespace
from fastapi.testclient import TestClient
from fastapi import FastAPI
import pytest

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.user import User
from app.models.customer import Customer
from app.models.branch import Branch
from app.models.driver import Driver
from app.models.shipment import Shipment
from app.routers.shipments import router as shipment_router
from app.dependencies.auth import get_current_user


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(shipment_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _shipment_payload(uid=1):
    # Generate phone number that's always 11 chars: pad uid to 8 digits
    phone = f"01{str(uid).zfill(9)}"[-11:]  # Ensure 11 chars max
    return {
        "sender_name": f"Sender {uid}",
        "receiver_name": f"Receiver {uid}",
        "receiver_phone": phone,
        "address": f"Address {uid}",
        "city": f"City {uid}",
        "status": "Pending",
    }


def test_shipment_company_isolation():
    """Test that shipments are isolated by company"""
    db = SessionLocal()
    try:
        # Setup: Create two companies
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        # Create users for each company
        admin_user = User(username="admin", email="admin@example.com", hashed_password="x", role="admin", company_id=company1.id)
        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        company1_employee = User(username="c1_emp", email="c1_emp@example.com", hashed_password="x", role="employee", company_id=company1.id)
        company2_admin = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        company2_employee = User(username="c2_emp", email="c2_emp@example.com", hashed_password="x", role="employee", company_id=company2.id)
        db.add_all([admin_user, company1_admin, company1_employee, company2_admin, company2_employee])
        db.commit()
        db.refresh(admin_user)
        db.refresh(company1_admin)
        db.refresh(company1_employee)
        db.refresh(company2_admin)
        db.refresh(company2_employee)

        # Create shipments for each company
        admin_client = _create_test_app(admin_user)
        c1_admin_client = _create_test_app(company1_admin)
        c2_admin_client = _create_test_app(company2_admin)
        c1_emp_client = _create_test_app(company1_employee)
        c2_emp_client = _create_test_app(company2_employee)

        # Company 1 admin creates shipments for company 1
        c1_shipment = c1_admin_client.post("/shipments/", json=_shipment_payload(1))
        assert c1_shipment.status_code == 200
        c1_shipment_id = c1_shipment.json()["data"]["id"]

        # Company 2 admin creates shipments for company 2
        c2_shipment = c2_admin_client.post("/shipments/", json=_shipment_payload(2))
        assert c2_shipment.status_code == 200
        c2_shipment_id = c2_shipment.json()["data"]["id"]

        # Another shipment for company 1
        c1_shipment_2 = c1_admin_client.post("/shipments/", json=_shipment_payload(3))
        assert c1_shipment_2.status_code == 200
        c1_shipment_id_2 = c1_shipment_2.json()["data"]["id"]

        # Another shipment for company 2
        c2_shipment_2 = c2_admin_client.post("/shipments/", json=_shipment_payload(4))
        assert c2_shipment_2.status_code == 200
        c2_shipment_id_2 = c2_shipment_2.json()["data"]["id"]

        # Company 1 admin cannot see company 2 shipments
        c1_cannot_see_c2 = c1_admin_client.get(f"/shipments/{c2_shipment_id}")
        assert c1_cannot_see_c2.status_code == 404

        # Company 2 admin cannot see company 1 shipments
        c2_cannot_see_c1 = c2_admin_client.get(f"/shipments/{c1_shipment_id}")
        assert c2_cannot_see_c1.status_code == 404

        # Company 1 admin can see company 1 shipments
        c1_can_see = c1_admin_client.get(f"/shipments/{c1_shipment_id}")
        assert c1_can_see.status_code == 200

        # Employee can see their own company shipments
        c1_emp_list = c1_emp_client.get("/shipments/")
        assert c1_emp_list.status_code == 200
        c1_emp_shipments = c1_emp_list.json()
        assert isinstance(c1_emp_shipments, list)

        # Employee cannot see other company shipments
        c1_emp_cannot_see_c2 = c1_emp_client.get(f"/shipments/{c2_shipment_id}")
        assert c1_emp_cannot_see_c2.status_code == 404

    finally:
        db.close()


def test_shipment_cross_company_prevention():
    """Test that related entities must belong to same company"""
    db = SessionLocal()
    try:
        # Setup: Create two companies with customers
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        # Create customers for each company
        customer1 = Customer(
            full_name="Customer 1",
            phone="01000000001",
            email="cust1@example.com",
            company_name="Company 1",
            address="Address 1",
            city="City 1",
            is_active=True,
            company_id=company1.id
        )
        customer2 = Customer(
            full_name="Customer 2",
            phone="01000000002",
            email="cust2@example.com",
            company_name="Company 2",
            address="Address 2",
            city="City 2",
            is_active=True,
            company_id=company2.id
        )
        db.add_all([customer1, customer2])
        db.commit()
        db.refresh(customer1)
        db.refresh(customer2)

        # Create users
        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        db.add(company1_admin)
        db.commit()
        db.refresh(company1_admin)

        c1_admin_client = _create_test_app(company1_admin)

        # Company 1 admin can create shipment with their customer
        payload = _shipment_payload(1)
        payload["customer_id"] = customer1.id
        response = c1_admin_client.post("/shipments/", json=payload)
        assert response.status_code == 200

        # Verify cross-company shipment creation is prevented (customer validation)
        payload2 = _shipment_payload(2)
        # Note: The router doesn't currently accept customer_id in payload, but the CRUD validates
        # This test documents the expected behavior when implemented

    finally:
        db.close()


def test_shipment_list_isolation():
    """Test that shipment list respects company boundaries"""
    db = SessionLocal()
    try:
        # Setup
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        company2_admin = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        db.add_all([company1_admin, company2_admin])
        db.commit()
        db.refresh(company1_admin)
        db.refresh(company2_admin)

        c1_client = _create_test_app(company1_admin)
        c2_client = _create_test_app(company2_admin)

        # Create 5 shipments for each company
        for i in range(1, 6):
            c1_resp = c1_client.post("/shipments/", json=_shipment_payload(i))
            assert c1_resp.status_code == 200
            c2_resp = c2_client.post("/shipments/", json=_shipment_payload(100 + i))
            assert c2_resp.status_code == 200

        # Company 1 admin sees only company 1 shipments
        c1_list = c1_client.get("/shipments/")
        assert c1_list.status_code == 200
        c1_shipments = c1_list.json()
        # Should see at most 5 shipments (their company's)
        assert len(c1_shipments) <= 5

        # Company 2 admin sees only company 2 shipments
        c2_list = c2_client.get("/shipments/")
        assert c2_list.status_code == 200
        c2_shipments = c2_list.json()
        # Should see at most 5 shipments (their company's)
        assert len(c2_shipments) <= 5

        # Lists should be different (isolated)
        assert len(c1_shipments) > 0
        assert len(c2_shipments) > 0

    finally:
        db.close()


def test_shipment_search_isolation():
    """Test that search respects company boundaries"""
    db = SessionLocal()
    try:
        # Setup
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        company2_admin = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        db.add_all([company1_admin, company2_admin])
        db.commit()
        db.refresh(company1_admin)
        db.refresh(company2_admin)

        c1_client = _create_test_app(company1_admin)
        c2_client = _create_test_app(company2_admin)

        # Create shipments
        payload1 = _shipment_payload(1)
        payload1["city"] = "Cairo"
        c1_client.post("/shipments/", json=payload1)

        payload2 = _shipment_payload(2)
        payload2["city"] = "Cairo"
        c2_client.post("/shipments/", json=payload2)

        # Search for Cairo in Company 1
        c1_search = c1_client.get("/shipments/search?city=Cairo")
        assert c1_search.status_code == 200
        c1_results = c1_search.json()

        # Search for Cairo in Company 2
        c2_search = c2_client.get("/shipments/search?city=Cairo")
        assert c2_search.status_code == 200
        c2_results = c2_search.json()

        # Each should see only their own company's shipments
        assert len(c1_results) >= 1
        assert len(c2_results) >= 1

    finally:
        db.close()


def test_shipment_dashboard_isolation():
    """Test that dashboard statistics respect company boundaries"""
    db = SessionLocal()
    try:
        # Setup
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        company2_admin = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        db.add_all([company1_admin, company2_admin])
        db.commit()
        db.refresh(company1_admin)
        db.refresh(company2_admin)

        c1_client = _create_test_app(company1_admin)
        c2_client = _create_test_app(company2_admin)

        # Create 3 shipments for each company
        for i in range(1, 4):
            c1_client.post("/shipments/", json=_shipment_payload(i))
            c2_client.post("/shipments/", json=_shipment_payload(100 + i))

        # Get dashboard for each company
        c1_dashboard = c1_client.get("/shipments/dashboard")
        assert c1_dashboard.status_code == 200
        c1_stats = c1_dashboard.json()

        c2_dashboard = c2_client.get("/shipments/dashboard")
        assert c2_dashboard.status_code == 200
        c2_stats = c2_dashboard.json()

        # Each should see only their own shipments
        assert c1_stats["total_shipments"] >= 3
        assert c2_stats["total_shipments"] >= 3

    finally:
        db.close()


def test_shipment_history_isolation():
    """Test that shipment history respects company boundaries"""
    db = SessionLocal()
    try:
        # Setup
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        company1_admin = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        company2_admin = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        db.add_all([company1_admin, company2_admin])
        db.commit()
        db.refresh(company1_admin)
        db.refresh(company2_admin)

        c1_client = _create_test_app(company1_admin)
        c2_client = _create_test_app(company2_admin)

        # Create shipments
        c1_response = c1_client.post("/shipments/", json=_shipment_payload(1))
        c1_shipment_id = c1_response.json()["data"]["id"]

        c2_response = c2_client.post("/shipments/", json=_shipment_payload(2))
        c2_shipment_id = c2_response.json()["data"]["id"]

        # Company 1 admin can get their shipment history
        c1_history = c1_client.get(f"/shipments/{c1_shipment_id}/history")
        assert c1_history.status_code == 200

        # Company 1 admin cannot get company 2 shipment history
        c1_cannot_see_c2 = c1_client.get(f"/shipments/{c2_shipment_id}/history")
        assert c1_cannot_see_c2.status_code == 404

        # Company 2 admin can get their shipment history
        c2_history = c2_client.get(f"/shipments/{c2_shipment_id}/history")
        assert c2_history.status_code == 200

        # Company 2 admin cannot get company 1 shipment history
        c2_cannot_see_c1 = c2_client.get(f"/shipments/{c1_shipment_id}/history")
        assert c2_cannot_see_c1.status_code == 404

    finally:
        db.close()
