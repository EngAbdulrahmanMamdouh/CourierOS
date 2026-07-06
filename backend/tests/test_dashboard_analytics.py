from datetime import datetime, timezone, timedelta

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.user import User
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.branch import Branch
from app.models.city import City
from app.models.shipment import Shipment
from app.models.payment import Payment
from app.models.pickup_request import PickupRequest
from app.routers.dashboard import router as dashboard_router
from app.dependencies.auth import get_current_user


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(dashboard_router)
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _create_company_data(db, company_name, company_code):
    company = Company(name=company_name, code=company_code, is_active=True)
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


def _create_customer(db, full_name, phone, company_name, city, company_id):
    customer = Customer(
        full_name=full_name,
        phone=phone,
        email=f"{phone}@example.com",
        company_name=company_name,
        address="123 Main St",
        city=city,
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


def _create_branch(db, name, city, company_id):
    branch = Branch(
        name=name,
        code=name.lower().replace(" ", "_"),
        address="456 Branch Rd",
        city=city,
        phone="01234567890",
        company_id=company_id,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def _create_shipment(
    db,
    owner_id,
    company_id,
    status="Pending",
    city="Cairo",
    customer_id=None,
    estimated_delivery_days: int = 1,
    delivered_at=None,
    created_at=None,
):
    shipment = Shipment(
        sender_name="Sender",
        receiver_name="Receiver",
        receiver_phone="01234567890",
        address="1 Example St",
        city=city,
        status=status,
        owner_id=owner_id,
        company_id=company_id,
        customer_id=customer_id,
        tracking_number=None,
        estimated_delivery_days=estimated_delivery_days,
        delivered_at=delivered_at,
        created_at=created_at or datetime.now(timezone.utc),
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment


def _create_payment(db, customer_id, company_id, amount, status, reference, created_at=None, is_deleted=False):
    payment = Payment(
        customer_id=customer_id,
        company_id=company_id,
        amount=amount,
        currency="EGP",
        payment_method="Cash",
        payment_status=status,
        transaction_reference=reference,
        paid_at=datetime.now(timezone.utc),
        created_at=created_at or datetime.now(timezone.utc),
        is_deleted=is_deleted,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def _create_pickup_request(db, customer_id, city_id, created_by, preferred_pickup_date, is_deleted=False):
    pickup = PickupRequest(
        customer_id=customer_id,
        pickup_address="789 Pickup Ave",
        city_id=city_id,
        contact_name="Contact",
        contact_phone="01234567890",
        preferred_pickup_date=preferred_pickup_date,
        preferred_time_window="09:00-12:00",
        status="Pending",
        created_by=created_by,
        is_deleted=is_deleted,
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return pickup


def test_dashboard_analytics_computes_expected_metrics_for_company_admin():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "Company A", "COMP_A")
        other_company = _create_company_data(db, "Company B", "COMP_B")

        company_admin = _create_user(db, "company_admin", "admin@example.com", "company_admin", company.id)
        _create_user(db, "other_admin", "other@example.com", "company_admin", other_company.id)

        customer = _create_customer(db, "Customer A", "01000000001", "Customer A LLC", "Cairo", company.id)
        other_customer = _create_customer(db, "Customer B", "01000000002", "Customer B LLC", "Alex", other_company.id)

        driver = _create_driver(db, "Driver A", "01100000001", company.id)
        branch = _create_branch(db, "Branch A", "Cairo", company.id)

        city = City(name="Cairo", code="CAI", governorate="Cairo", company_id=company.id, is_active=True)
        db.add(city)
        db.commit()
        db.refresh(city)

        shipment1 = _create_shipment(db, company_admin.id, company.id, status="Pending", city="Cairo", customer_id=customer.id)
        shipment2 = _create_shipment(db, company_admin.id, company.id, status="Delivered", city="Cairo", customer_id=customer.id, delivered_at=datetime.now(timezone.utc))
        shipment3 = _create_shipment(db, company_admin.id, company.id, status="Cancelled", city="Alex", customer_id=customer.id)
        deleted_shipment = _create_shipment(db, company_admin.id, company.id, status="Pending", city="Cairo", customer_id=customer.id)
        deleted_shipment.is_deleted = True
        db.commit()

        _create_shipment(db, company_admin.id, other_company.id, status="Pending", city="Cairo")

        _create_payment(db, customer.id, company.id, 100, "Pending", "TXN1")
        _create_payment(db, customer.id, company.id, 50, "Completed", "TXN2")
        _create_payment(db, customer.id, company.id, 25, "Pending", "TXN3", is_deleted=True)

        _create_pickup_request(db, customer.id, city.id, company_admin.id, datetime.now(timezone.utc))
        _create_pickup_request(db, customer.id, city.id, company_admin.id, datetime.now(timezone.utc), is_deleted=True)

        client = _create_test_app(company_admin)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["statistics"]["total_shipments"] == 3
        assert data["statistics"]["pending"] == 1
        assert data["statistics"]["delivered"] == 1
        assert data["statistics"]["cancelled"] == 1
        assert data["statistics"]["today_shipments"] == 3

        assert any(item["status"] == "Pending" for item in data["charts"]["shipments_by_status"])
        assert any(item["status"] == "Delivered" for item in data["charts"]["shipments_by_status"])
        assert any(item["status"] == "Cancelled" for item in data["charts"]["shipments_by_status"])

        assert data["cod_summary"]["pending_amount"] == 100.0
        assert data["cod_summary"]["completed_amount"] == 50.0
        assert data["cod_summary"]["pending_count"] == 1
        assert data["cod_summary"]["completed_count"] == 1
    finally:
        db.close()


def test_dashboard_stats_endpoint_returns_counts_for_company_admin():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "Company A", "COMP_A")
        company_admin = _create_user(db, "company_admin", "admin@example.com", "company_admin", company.id)

        _create_shipment(db, company_admin.id, company.id, status="Pending", city="Cairo")
        _create_shipment(db, company_admin.id, company.id, status="Delivered", city="Cairo")
        _create_shipment(db, company_admin.id, company.id, status="Cancelled", city="Alex")

        client = _create_test_app(company_admin)
        response = client.get("/dashboard/stats")

        assert response.status_code == 200
        assert response.json() == {
            "total_shipments": 3,
            "pending": 1,
            "in_transit": 0,
            "delivered": 1,
            "cancelled": 1,
        }
    finally:
        db.close()


def test_dashboard_analytics_platform_admin_sees_all_companies():
    db = SessionLocal()
    try:
        company1 = _create_company_data(db, "Platform 1", "PLAT1")
        company2 = _create_company_data(db, "Platform 2", "PLAT2")

        admin = _create_user(db, "platform_admin", "platform_admin@example.com", "admin")
        company1_admin = _create_user(db, "c1_admin", "c1_admin@example.com", "company_admin", company1.id)

        customer1 = _create_customer(db, "Customer 1", "01000000005", "Customer 1 LLC", "Cairo", company1.id)
        customer2 = _create_customer(db, "Customer 2", "01000000006", "Customer 2 LLC", "Alex", company2.id)

        _create_shipment(db, company1_admin.id, company1.id, status="Pending", city="Cairo", customer_id=customer1.id)
        _create_shipment(db, company1_admin.id, company2.id, status="Pending", city="Alex", customer_id=customer2.id)

        client = _create_test_app(admin)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["statistics"]["total_shipments"] == 2
        assert any(item["city"] == "Cairo" for item in data["charts"]["most_active_cities"])
        assert any(customer["company_name"] == customer1.company_name for customer in data["top_customers"]) or any(customer["company_name"] == customer2.company_name for customer in data["top_customers"])
    finally:
        db.close()


def test_dashboard_analytics_employee_sees_permitted_company_shipments():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "EmpCo", "EMP")
        other_company = _create_company_data(db, "OtherCo", "OTH")

        employee = _create_user(db, "employee", "employee@example.com", "employee", company.id)
        owner = _create_user(db, "owner", "owner@example.com", "company_admin", company.id)
        other_owner = _create_user(db, "other_owner", "other_owner@example.com", "company_admin", other_company.id)

        customer1 = _create_customer(db, "Customer 1", "01000000009", "Cust 1", "Cairo", company.id)
        customer2 = _create_customer(db, "Customer 2", "01000000010", "Cust 2", "Alex", other_company.id)
        shipment_own = _create_shipment(db, employee.id, company.id, status="Pending", city="Cairo", customer_id=customer1.id)
        _create_shipment(db, other_owner.id, other_company.id, status="Pending", city="Alex", customer_id=customer2.id)

        client = _create_test_app(employee)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["statistics"]["total_shipments"] == 1
        assert all(city["city"] != "Alex" for city in data["charts"]["most_active_cities"])
    finally:
        db.close()


def test_dashboard_analytics_empty_database_returns_empty_results():
    db = SessionLocal()
    try:
        admin = _create_user(db, "admin", "admin@example.com", "admin")
        client = _create_test_app(admin)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["statistics"]["total_shipments"] == 0
        assert data["statistics"]["pending"] == 0
        assert data["statistics"]["in_transit"] == 0
        assert data["statistics"]["delivered"] == 0
        assert data["statistics"]["cancelled"] == 0
        assert data["statistics"]["today_shipments"] == 0
        assert data["charts"]["shipments_by_status"] == []
        assert data["charts"]["shipments_by_day"] == []
        assert data["charts"]["monthly_growth"] == []
        assert data["charts"]["most_active_cities"] == []
        assert data["recent_shipments"] == []
        assert data["latest_payments"] == []
        assert data["latest_pickup_requests"] == []
        assert data["top_customers"] == []
        assert data["top_drivers"] == []
        assert data["top_branches"] == []
        assert data["cod_summary"]["pending_amount"] == 0.0
        assert data["cod_summary"]["completed_amount"] == 0.0
        assert data["cod_summary"]["pending_count"] == 0
        assert data["cod_summary"]["completed_count"] == 0
    finally:
        db.close()


def test_dashboard_analytics_delivery_performance_counts_on_time_and_delayed():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "DeliveryCo", "DELIV")
        owner = _create_user(db, "owner2", "owner2@example.com", "company_admin", company.id)

        base_time = datetime.now(timezone.utc)
        on_time_shipment = _create_shipment(
            db,
            owner.id,
            company.id,
            status="Delivered",
            city="Cairo",
            estimated_delivery_days=2,
            created_at=base_time - timedelta(days=3),
            delivered_at=base_time - timedelta(days=1),
        )

        delayed_shipment = _create_shipment(
            db,
            owner.id,
            company.id,
            status="Delivered",
            city="Alex",
            estimated_delivery_days=2,
            created_at=base_time - timedelta(days=4),
            delivered_at=base_time - timedelta(days=1),
        )

        client = _create_test_app(owner)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["delivery_performance"]["on_time"] == 1
        assert data["delivery_performance"]["delayed"] == 1
    finally:
        db.close()


def test_dashboard_analytics_recent_shipments_ordering_and_rankings():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "RankCo", "RANK")
        owner = _create_user(db, "rank_owner", "rank_owner@example.com", "company_admin", company.id)

        customer1 = _create_customer(db, "Top Customer 1", "01000000007", "Top Customer 1 LLC", "Cairo", company.id)
        customer2 = _create_customer(db, "Top Customer 2", "01000000008", "Top Customer 2 LLC", "Alex", company.id)

        driver1 = _create_driver(db, "Top Driver 1", "01100000002", company.id)
        driver2 = _create_driver(db, "Top Driver 2", "01100000003", company.id)

        branch1 = _create_branch(db, "Branch One", "Cairo", company.id)
        branch2 = _create_branch(db, "Branch Two", "Alex", company.id)

        shipment1 = _create_shipment(db, owner.id, company.id, status="Pending", city="Cairo")
        shipment2 = _create_shipment(db, owner.id, company.id, status="Delivered", city="Alex")
        shipment3 = _create_shipment(db, owner.id, company.id, status="Pending", city="Cairo")

        # ensure order by created_at descending
        client = _create_test_app(owner)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        assert data["recent_shipments"][0]["id"] == shipment3.id
        assert data["recent_shipments"][1]["id"] == shipment2.id
        assert data["recent_shipments"][2]["id"] == shipment1.id

        assert len(data["charts"]["most_active_cities"]) >= 1
        assert data["charts"]["most_active_cities"][0]["city"] in {"Cairo", "Alex"}
        assert data["top_drivers"][0]["id"] == driver2.id
        assert data["top_branches"][0]["id"] == branch2.id
    finally:
        db.close()


def test_dashboard_analytics_charts_aggregation_is_correct():
    db = SessionLocal()
    try:
        company = _create_company_data(db, "ChartCo", "CHRT")
        owner = _create_user(db, "chart_owner", "chart_owner@example.com", "company_admin", company.id)

        customer1 = _create_customer(db, "Customer 1", "01000000011", "Cust 1", "Cairo", company.id)
        customer2 = _create_customer(db, "Customer 2", "01000000012", "Cust 2", "Alex", company.id)

        _create_shipment(db, owner.id, company.id, status="Pending", city="Cairo", customer_id=customer1.id)
        _create_shipment(db, owner.id, company.id, status="Pending", city="Cairo", customer_id=customer1.id)
        _create_shipment(db, owner.id, company.id, status="Delivered", city="Alex", customer_id=customer2.id)

        client = _create_test_app(owner)
        response = client.get("/dashboard/analytics")
        assert response.status_code == 200
        data = response.json()

        status_counts = {item["status"]: item["count"] for item in data["charts"]["shipments_by_status"]}
        assert status_counts["Pending"] == 2
        assert status_counts["Delivered"] == 1

        days = {item["day"]: item["count"] for item in data["charts"]["shipments_by_day"]}
        assert sum(days.values()) == 3
    finally:
        db.close()
    db = SessionLocal()
    try:
        company1 = _create_company_data(db, "Company 1", "COMP1")
        company2 = _create_company_data(db, "Company 2", "COMP2")

        company1_admin = _create_user(db, "c1_admin", "c1_admin@example.com", "company_admin", company1.id)
        company2_admin = _create_user(db, "c2_admin", "c2_admin@example.com", "company_admin", company2.id)

        customer1 = _create_customer(db, "Customer 1", "01000000003", "Cust 1", "Cairo", company1.id)
        customer2 = _create_customer(db, "Customer 2", "01000000004", "Cust 2", "Alex", company2.id)

        _create_shipment(db, company1_admin.id, company1.id, status="Pending", city="Cairo")
        _create_shipment(db, company1_admin.id, company1.id, status="Pending", city="Cairo", customer_id=customer1.id)
        _create_shipment(db, company1_admin.id, company2.id, status="Pending", city="Alex", customer_id=customer2.id)

        _create_payment(db, customer1.id, company1.id, 60, "Pending", "TXN4")
        _create_payment(db, customer2.id, company2.id, 40, "Completed", "TXN5")

        client1 = _create_test_app(company1_admin)
        response1 = client1.get("/dashboard/analytics")
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["statistics"]["total_shipments"] == 2
        assert data1["cod_summary"]["pending_amount"] == 60.0
        assert all(customer["company_name"] == customer1.company_name for customer in data1["top_customers"])

        client2 = _create_test_app(company2_admin)
        response2 = client2.get("/dashboard/analytics")
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["statistics"]["total_shipments"] == 1
        assert data2["cod_summary"]["completed_amount"] == 40.0
        assert all(customer["company_name"] == customer2.company_name for customer in data2["top_customers"])
    finally:
        db.close()
