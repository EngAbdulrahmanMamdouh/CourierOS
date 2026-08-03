from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.models.branch import Branch
from app.models.company import Company
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.payment import Payment
from app.models.shipment import Shipment
from app.models.user import User
from app.routers.customers import router as customer_router
from app.routers.dashboard import router as dashboard_router
from app.routers.drivers import router as driver_router
from app.routers.payments import router as payment_router
from app.routers.shipments import router as shipment_router
from app.dependencies.auth import get_current_user


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(shipment_router)
    app.include_router(customer_router)
    app.include_router(driver_router)
    app.include_router(payment_router)
    app.include_router(dashboard_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _create_company(db, name, code):
    company = Company(name=name, code=code, is_active=True)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def _create_user(db, username, email, role, company_id=None):
    user = User(username=username, email=email, hashed_password="x", role=role, company_id=company_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_customer(db, full_name, phone, company_name, company_id):
    customer = Customer(
        full_name=full_name,
        phone=phone,
        email=f"{phone}@example.com",
        company_name=company_name,
        address="123 Main St",
        city="Cairo",
        company_id=company_id,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def _create_driver(db, full_name, phone, company_id):
    driver = Driver(
        full_name=full_name,
        phone=phone,
        national_id="NID123",
        license_number="LIC123",
        vehicle_type="Van",
        vehicle_plate="ABC123",
        company_id=company_id,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def _create_branch(db, name, company_id):
    branch = Branch(
        name=name,
        code=name.lower().replace(" ", "_"),
        address="456 Branch Rd",
        city="Cairo",
        phone="01234567890",
        company_id=company_id,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def _create_shipment(db, owner_id, company_id, customer_id, status="Pending"):
    shipment = Shipment(
        sender_name="Sender",
        receiver_name="Receiver",
        receiver_phone="01234567890",
        address="1 Test St",
        city="Cairo",
        status=status,
        owner_id=owner_id,
        company_id=company_id,
        customer_id=customer_id,
        estimated_delivery_days=2,
        created_at=datetime.now(timezone.utc),
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment


def _create_payment(db, customer_id, company_id, amount, status, reference):
    payment = Payment(
        customer_id=customer_id,
        company_id=company_id,
        amount=amount,
        currency="EGP",
        payment_method="Cash",
        payment_status=status,
        transaction_reference=reference,
        paid_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def test_cross_tenant_access_isolated_for_company_a_and_company_b():
    db = SessionLocal()
    try:
        company_a = _create_company(db, "Company A", "C1")
        company_b = _create_company(db, "Company B", "C2")

        company_a_user = _create_user(db, "company_a_user", "a@example.com", "company_admin", company_a.id)
        company_b_user = _create_user(db, "company_b_user", "b@example.com", "company_admin", company_b.id)
        platform_admin = _create_user(db, "platform_admin", "platform@example.com", "admin")

        customer_a = _create_customer(db, "Customer A", "01000000001", "Company A LLC", company_a.id)
        customer_b = _create_customer(db, "Customer B", "01000000002", "Company B LLC", company_b.id)

        driver_a = _create_driver(db, "Driver A", "01100000001", company_a.id)
        driver_b = _create_driver(db, "Driver B", "01100000002", company_b.id)

        branch_a = _create_branch(db, "Branch A", company_a.id)
        branch_b = _create_branch(db, "Branch B", company_b.id)

        shipment_a = _create_shipment(db, company_a_user.id, company_a.id, customer_a.id, status="Pending")
        shipment_b = _create_shipment(db, company_b_user.id, company_b.id, customer_b.id, status="Delivered")

        payment_a = _create_payment(db, customer_a.id, company_a.id, 100, "Completed", "TXN-A")
        payment_b = _create_payment(db, customer_b.id, company_b.id, 200, "Pending", "TXN-B")

        client_a = _create_test_app(company_a_user)
        client_b = _create_test_app(company_b_user)
        client_admin = _create_test_app(platform_admin)

        # Shipments
        a_shipments = client_a.get("/shipments/")
        b_shipments = client_b.get("/shipments/")
        assert a_shipments.status_code == 200
        assert b_shipments.status_code == 200
        assert all(item["id"] != shipment_b.id for item in a_shipments.json())
        assert all(item["id"] != shipment_a.id for item in b_shipments.json())

        a_single_shipment = client_a.get(f"/shipments/{shipment_b.id}")
        b_single_shipment = client_b.get(f"/shipments/{shipment_a.id}")
        assert a_single_shipment.status_code == 404
        assert b_single_shipment.status_code == 404

        # Customers
        a_customers = client_a.get("/customers/")
        b_customers = client_b.get("/customers/")
        assert a_customers.status_code == 200
        assert b_customers.status_code == 200
        assert all(item["id"] != customer_b.id for item in a_customers.json())
        assert all(item["id"] != customer_a.id for item in b_customers.json())

        a_customer_detail = client_a.get(f"/customers/{customer_b.id}")
        b_customer_detail = client_b.get(f"/customers/{customer_a.id}")
        assert a_customer_detail.status_code == 404
        assert b_customer_detail.status_code == 404

        # Drivers
        a_drivers = client_a.get("/drivers/")
        b_drivers = client_b.get("/drivers/")
        assert a_drivers.status_code == 200
        assert b_drivers.status_code == 200
        assert all(item["id"] != driver_b.id for item in a_drivers.json())
        assert all(item["id"] != driver_a.id for item in b_drivers.json())

        a_driver_detail = client_a.get(f"/drivers/{driver_b.id}")
        b_driver_detail = client_b.get(f"/drivers/{driver_a.id}")
        assert a_driver_detail.status_code == 404
        assert b_driver_detail.status_code == 404

        # Payments
        a_payments = client_a.get("/payments/")
        b_payments = client_b.get("/payments/")
        assert a_payments.status_code == 200
        assert b_payments.status_code == 200
        assert all(item["id"] != payment_b.id for item in a_payments.json())
        assert all(item["id"] != payment_a.id for item in b_payments.json())

        a_payment_detail = client_a.get(f"/payments/{payment_b.id}")
        b_payment_detail = client_b.get(f"/payments/{payment_a.id}")
        assert a_payment_detail.status_code == 404
        assert b_payment_detail.status_code == 404

        # Dashboard analytics
        a_dashboard = client_a.get("/dashboard/analytics")
        b_dashboard = client_b.get("/dashboard/analytics")
        assert a_dashboard.status_code == 200
        assert b_dashboard.status_code == 200
        assert a_dashboard.json()["statistics"]["total_shipments"] == 1
        assert b_dashboard.json()["statistics"]["total_shipments"] == 1
        assert all(item["id"] != shipment_b.id for item in a_dashboard.json()["recent_shipments"])
        assert all(item["id"] != shipment_a.id for item in b_dashboard.json()["recent_shipments"])

        # Platform admin can see both
        admin_shipments = client_admin.get("/shipments/")
        admin_customers = client_admin.get("/customers/")
        admin_drivers = client_admin.get("/drivers/")
        admin_payments = client_admin.get("/payments/")
        admin_dashboard = client_admin.get("/dashboard/analytics")
        assert admin_shipments.status_code == 200
        assert admin_customers.status_code == 200
        assert admin_drivers.status_code == 200
        assert admin_payments.status_code == 200
        assert admin_dashboard.status_code == 200
        assert any(item["id"] == shipment_a.id for item in admin_shipments.json())
        assert any(item["id"] == shipment_b.id for item in admin_shipments.json())
        assert any(item["id"] == customer_a.id for item in admin_customers.json())
        assert any(item["id"] == customer_b.id for item in admin_customers.json())
        assert any(item["id"] == driver_a.id for item in admin_drivers.json())
        assert any(item["id"] == driver_b.id for item in admin_drivers.json())
        assert any(item["id"] == payment_a.id for item in admin_payments.json())
        assert any(item["id"] == payment_b.id for item in admin_payments.json())
    finally:
        db.close()
