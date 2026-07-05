from types import SimpleNamespace
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.user import User
from app.routers.shipments import router as shipment_router


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _create_test_app(user):
    app = FastAPI()
    app.include_router(shipment_router)
    from app.dependencies.auth import get_current_user
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


def test_shipment_label_endpoints_produce_files():
    db = SessionLocal()
    try:
        company = Company(name="Company 1", code="C1", is_active=True)
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(username="u1", email="u1@example.com", hashed_password="x", role="company_admin", company_id=company.id)
        db.add(user)
        db.commit()
        db.refresh(user)

        client = _create_test_app(user)

        # create shipment
        resp = client.post("/shipments/", json=_shipment_payload(1))
        assert resp.status_code == 200
        shipment_id = resp.json()["data"]["id"]

        # label PDF
        label_resp = client.get(f"/shipments/{shipment_id}/label")
        assert label_resp.status_code == 200
        assert label_resp.headers.get("content-type") == "application/pdf"
        assert len(label_resp.content) > 100

        # barcode PNG
        barcode_resp = client.get(f"/shipments/{shipment_id}/barcode")
        assert barcode_resp.status_code == 200
        assert barcode_resp.headers.get("content-type") == "image/png"
        assert len(barcode_resp.content) > 100

        # qrcode PNG
        qrcode_resp = client.get(f"/shipments/{shipment_id}/qrcode")
        assert qrcode_resp.status_code == 200
        assert qrcode_resp.headers.get("content-type") == "image/png"
        assert len(qrcode_resp.content) > 100

    finally:
        db.close()
