from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.crud import shipment as shipment_crud
from app.models.shipment import Shipment
from app.models.user import User


def test_create_shipment_assigns_owner_id():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        owner = User(username="owner", email="owner@example.com", hashed_password="x", role="employee")
        db.add(owner)
        db.commit()
        db.refresh(owner)

        shipment_data = type(
            "ShipmentData",
            (),
            {
                "sender_name": "Alice",
                "receiver_name": "Bob",
                "receiver_phone": "12345678901",
                "address": "123 Main St",
                "city": "Cairo",
            },
        )()

        shipment = shipment_crud.create_shipment(db, shipment_data, owner_id=owner.id)

        assert shipment.owner_id == owner.id
    finally:
        db.close()


def test_get_accessible_shipments_filters_for_non_admin_user():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        owner = User(username="owner2", email="owner2@example.com", hashed_password="x", role="employee")
        other_user = User(username="other", email="other@example.com", hashed_password="x", role="employee")
        db.add_all([owner, other_user])
        db.commit()
        db.refresh(owner)
        db.refresh(other_user)

        shipment_crud.create_shipment(
            db,
            type(
                "ShipmentData",
                (),
                {
                    "sender_name": "Alice",
                    "receiver_name": "Bob",
                    "receiver_phone": "12345678901",
                    "address": "123 Main St",
                    "city": "Cairo",
                },
            )(),
            owner_id=owner.id,
        )
        shipment_crud.create_shipment(
            db,
            type(
                "ShipmentData",
                (),
                {
                    "sender_name": "Carol",
                    "receiver_name": "Dan",
                    "receiver_phone": "12345678901",
                    "address": "456 Main St",
                    "city": "Alex",
                },
            )(),
            owner_id=other_user.id,
        )

        accessible_shipments = shipment_crud.get_accessible_shipments(db, current_user=owner)

        assert len(accessible_shipments) == 1
        assert accessible_shipments[0].owner_id == owner.id
    finally:
        db.close()
