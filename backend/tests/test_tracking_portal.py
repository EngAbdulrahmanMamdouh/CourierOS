from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.dependencies.auth import get_current_user
from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.shipment import Shipment
from app.models.user import User
from app.routers.tracking import router as tracking_router
from app.routers.shipments import router as shipment_router


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user=None):
    app = FastAPI()
    app.include_router(shipment_router)
    app.include_router(tracking_router)
    if user is not None:
        app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


def _shipment_payload(uid=1):
    phone = f"01{str(uid).zfill(9)}"[-11:]
    return {
        "sender_name": f"Sender {uid}",
        "receiver_name": f"Receiver {uid}",
        "receiver_phone": phone,
        "address": f"Address {uid}",
        "city": f"City {uid}",
        "status": "Pending",
    }


def test_invalid_tracking_number_returns_404():
    db = SessionLocal()
    try:
        client = _create_test_app()
        r = client.get("/track/NOPE123")
        assert r.status_code == 404
    finally:
        db.close()


def test_pending_shipment_tracking():
    db = SessionLocal()
    try:
        company = Company(name="Co", code="C", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(username="u", email="u@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(user)
        db.commit()
        db.refresh(user)

        client = _create_test_app(user)
        resp = client.post("/shipments/", json=_shipment_payload(1))
        assert resp.status_code == 200
        tracking = resp.json()["data"].get("tracking_number")
        assert tracking is not None

        track_resp = client.get(f"/track/{tracking}")
        assert track_resp.status_code == 200
        body = track_resp.json()
        assert body["tracking_number"] == tracking
        assert body["status"] == "Pending"
        assert isinstance(body["timeline"], list)

    finally:
        db.close()


def test_legacy_display_tracking_format_matches_existing_shipment():
    db = SessionLocal()
    try:
        company = Company(name="CoLegacy", code="CL", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(username="ulegacy", email="uleg@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(user)
        db.commit()
        db.refresh(user)

        shipment = Shipment(
            sender_name="Sender",
            receiver_name="Receiver",
            receiver_phone="01000000000",
            address="Address",
            city="City",
            status="Pending",
            owner_id=user.id,
            company_id=company.id,
            tracking_number=None,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        client = _create_test_app(user)
        track_resp = client.get(f"/track/TRK-{shipment.id}")
        assert track_resp.status_code == 200
        body = track_resp.json()
        assert body["status"] == shipment.status
        assert body["receiver_name"] == shipment.receiver_name

    finally:
        db.close()


def test_delivered_shipment_tracking_and_timeline_order():
    db = SessionLocal()
    try:
        company = Company(name="Co2", code="C2", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(username="u2", email="u2@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(user)
        db.commit()
        db.refresh(user)

        client = _create_test_app(user)
        resp = client.post("/shipments/", json=_shipment_payload(2))
        assert resp.status_code == 200
        data = resp.json()["data"]
        tracking = data.get("tracking_number")

        # update status via status endpoint
        ship_id = data["id"]
        r1 = client.patch(f"/shipments/{ship_id}/status", json={"new_status": "In Transit"})
        assert r1.status_code == 200
        r2 = client.patch(f"/shipments/{ship_id}/status", json={"new_status": "Delivered"})
        assert r2.status_code == 200

        track_resp = client.get(f"/track/{tracking}")
        assert track_resp.status_code == 200
        body = track_resp.json()
        assert body["status"] == "Delivered"
        # timeline should be chronological
        times = [item["changed_at"] for item in body["timeline"]]
        assert times == sorted(times)

    finally:
        db.close()


def test_soft_deleted_shipment_inaccessible():
    db = SessionLocal()
    try:
        company = Company(name="Co3", code="C3", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(username="u3", email="u3@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(user)
        db.commit()
        db.refresh(user)

        client = _create_test_app(user)
        resp = client.post("/shipments/", json=_shipment_payload(3))
        assert resp.status_code == 200
        data = resp.json()["data"]
        tracking = data.get("tracking_number")
        ship_id = data["id"]

        # soft delete
        d = client.delete(f"/shipments/{ship_id}")
        assert d.status_code == 200

        # should not be accessible via public portal
        track_resp = client.get(f"/track/{tracking}")
        assert track_resp.status_code == 404

    finally:
        db.close()
