from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.shipment import Shipment
from app.models.user import User
from main import app


def test_status_update_endpoint_accepts_authenticated_request():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        user = User(username="status-user", email="status@example.com", hashed_password="x", role="employee")
        db.add(user)
        db.commit()
        db.refresh(user)

        shipment = Shipment(
            sender_name="Alice",
            receiver_name="Bob",
            receiver_phone="12345678901",
            address="123 Main St",
            city="Cairo",
            status="Pending",
            owner_id=user.id,
            company_id=1,
            estimated_delivery_days=2,
            notes="",
            cod_amount=0,
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
            return user

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = override_get_current_user

        with TestClient(app) as client:
            response = client.patch(
                f"/shipments/{shipment.id}/status",
                json={"new_status": "In Transit"},
            )

        assert response.status_code == 200
        assert response.json()["new_status"] == "In Transit"
    finally:
        app.dependency_overrides.clear()
        db.close()
