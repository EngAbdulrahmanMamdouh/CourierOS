from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.crud import shipment as shipment_crud
from app.database import Base
from app.models.user import User


def test_create_shipment_persists_extended_fields():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        owner = User(username="owner-ext", email="owner-ext@example.com", hashed_password="x", role="employee")
        db.add(owner)
        db.commit()
        db.refresh(owner)

        shipment_data = SimpleNamespace(
            sender_name="Alice",
            receiver_name="Bob",
            receiver_phone="12345678901",
            address="123 Main St",
            city="Cairo",
            status="In Transit",
            estimated_delivery_days=3,
            notes="Handle with care",
            cod_amount=250.5,
        )

        shipment = shipment_crud.create_shipment(db, shipment_data, owner_id=owner.id)

        assert shipment.status == "In Transit"
        assert shipment.estimated_delivery_days == 3
        assert shipment.notes == "Handle with care"
        assert shipment.cod_amount == 250.5
    finally:
        db.close()


def test_get_all_shipments_supports_search_and_status_filters():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        owner = User(username="owner-search", email="owner-search@example.com", hashed_password="x", role="employee")
        db.add(owner)
        db.commit()
        db.refresh(owner)

        shipment_crud.create_shipment(
            db,
            SimpleNamespace(
                sender_name="Alice",
                receiver_name="Bob",
                receiver_phone="12345678901",
                address="123 Main St",
                city="Cairo",
                status="Pending",
                estimated_delivery_days=2,
                notes="",
                cod_amount=0,
            ),
            owner_id=owner.id,
        )
        shipment_crud.create_shipment(
            db,
            SimpleNamespace(
                sender_name="Carol",
                receiver_name="Dina",
                receiver_phone="12345678901",
                address="456 Main St",
                city="Alexandria",
                status="Delivered",
                estimated_delivery_days=4,
                notes="",
                cod_amount=10,
            ),
            owner_id=owner.id,
        )

        results = shipment_crud.get_all_shipments(
            db,
            current_user=owner,
            search="Dina",
            status="Delivered",
            city="Alexandria",
        )

        assert len(results) == 1
        assert results[0].receiver_name == "Dina"
    finally:
        db.close()
