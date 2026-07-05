from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.customer import Customer
from app.models.shipment import Shipment
from app.models.user import User
from app.routers.customers import router as customer_router
from app.routers.shipments import router as shipment_router
from app.dependencies.auth import get_current_user


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(customer_router)
    app.include_router(shipment_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _customer_payload(uid=1):
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


def _shipment_payload(uid=1):
    return {
        "sender_name": f"Sender {uid}",
        "receiver_name": f"Receiver {uid}",
        "receiver_phone": f"01{str(uid).zfill(9)}"[-11:],
        "address": f"Address {uid}",
        "city": "Cairo",
        "status": "Pending",
    }


def test_customer_shipments_endpoint_role_scoping_and_soft_delete():
    db = SessionLocal()
    try:
        company1 = Company(name="Company 1", code="C1", is_active=True)
        company2 = Company(name="Company 2", code="C2", is_active=True)
        db.add_all([company1, company2])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)

        admin = User(username="admin", email="admin@example.com", hashed_password="x", role="admin", company_id=None)
        company_admin1 = User(username="c1_admin", email="c1_admin@example.com", hashed_password="x", role="company_admin", company_id=company1.id)
        employee1 = User(username="c1_emp", email="c1_emp@example.com", hashed_password="x", role="employee", company_id=company1.id)
        company_admin2 = User(username="c2_admin", email="c2_admin@example.com", hashed_password="x", role="company_admin", company_id=company2.id)
        db.add_all([admin, company_admin1, employee1, company_admin2])
        db.commit()
        db.refresh(admin)
        db.refresh(company_admin1)
        db.refresh(employee1)
        db.refresh(company_admin2)

        admin_client = _create_test_app(admin)
        c1_admin_client = _create_test_app(company_admin1)
        c1_employee_client = _create_test_app(employee1)
        c2_admin_client = _create_test_app(company_admin2)

        customer_response = c1_admin_client.post("/customers/", json=_customer_payload(101))
        assert customer_response.status_code == 200
        customer_id = customer_response.json()["id"]

        payload1 = _shipment_payload(201)
        payload2 = _shipment_payload(202)
        shipment1 = Shipment(
            sender_name=payload1["sender_name"],
            receiver_name=payload1["receiver_name"],
            receiver_phone=payload1["receiver_phone"],
            address=payload1["address"],
            city=payload1["city"],
            status="Pending",
            customer_id=customer_id,
            company_id=company1.id,
            owner_id=employee1.id,
        )
        shipment2 = Shipment(
            sender_name=payload2["sender_name"],
            receiver_name=payload2["receiver_name"],
            receiver_phone=payload2["receiver_phone"],
            address=payload2["address"],
            city=payload2["city"],
            status="Pending",
            customer_id=customer_id,
            company_id=company1.id,
            owner_id=employee1.id,
            is_deleted=True,
        )
        db.add_all([shipment1, shipment2])
        db.commit()
        db.refresh(shipment1)
        db.refresh(shipment2)
        shipment1_id = shipment1.id
        shipment2_id = shipment2.id

        c2_customer_response = c2_admin_client.post("/customers/", json=_customer_payload(102))
        assert c2_customer_response.status_code == 200
        c2_customer_id = c2_customer_response.json()["id"]
        c2_shipment = Shipment(
            sender_name="Other Sender",
            receiver_name="Other Receiver",
            receiver_phone="01111111111",
            address="Other Address",
            city="Giza",
            status="Pending",
            customer_id=c2_customer_id,
            company_id=company2.id,
            owner_id=company_admin2.id,
        )
        db.add(c2_shipment)
        db.commit()

        platform_result = admin_client.get(f"/customers/{customer_id}/shipments")
        assert platform_result.status_code == 200
        assert isinstance(platform_result.json(), list)
        assert all(item["id"] != shipment2_id for item in platform_result.json())

        c1_admin_result = c1_admin_client.get(f"/customers/{customer_id}/shipments")
        assert c1_admin_result.status_code == 200
        assert all(item["id"] != shipment2_id for item in c1_admin_result.json())

        c1_emp_result = c1_employee_client.get(f"/customers/{customer_id}/shipments")
        assert c1_emp_result.status_code == 200
        assert all(item["id"] != shipment2_id for item in c1_emp_result.json())

        c2_admin_customer_shipments = c2_admin_client.get(f"/customers/{customer_id}/shipments")
        assert c2_admin_customer_shipments.status_code == 200
        assert c2_admin_customer_shipments.json() == []
    finally:
        db.close()
