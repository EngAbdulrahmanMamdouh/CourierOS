from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.shipment import Shipment
from app.models.user import User
from app.services.audit_service import create_audit_log, get_audit_logs
from app.services.shipment_service import update_shipment_status
from app.models.shipment_status import ShipmentStatus


def test_create_and_retrieve_audit_log():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        user = User(username="audit-user", email="audit@example.com", hashed_password="x", role="admin")
        db.add(user)
        db.commit()

        log_entry = create_audit_log(
            db=db,
            actor_id=1,
            action="status_changed",
            entity="shipment",
            entity_id=42,
            description="Status changed to In Transit",
        )

        logs = get_audit_logs(db)

        assert len(logs) == 1
        assert logs[0].id == log_entry.id
        assert logs[0].action == "status_changed"
        assert logs[0].entity == "shipment"
        assert logs[0].entity_id == 42
        assert logs[0].description == "Status changed to In Transit"
    finally:
        db.close()


def test_update_shipment_status_creates_audit_log():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        user = User(username="audit-user-2", email="audit2@example.com", hashed_password="x", role="admin")
        db.add(user)
        db.commit()

        shipment = Shipment(
            sender_name="Alice",
            receiver_name="Bob",
            receiver_phone="12345678901",
            address="123 Main St",
            city="Cairo",
            status="Pending",
            owner_id=user.id,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        current_user = SimpleNamespace(id=1)

        update_shipment_status(
            db=db,
            shipment=shipment,
            new_status=ShipmentStatus.in_transit,
            current_user=current_user,
        )

        logs = get_audit_logs(db)

        assert len(logs) == 1
        assert logs[0].action == "status_changed"
        assert logs[0].entity == "shipment"
        assert logs[0].entity_id == shipment.id
        assert "Pending" in logs[0].description and "In Transit" in logs[0].description
    finally:
        db.close()
