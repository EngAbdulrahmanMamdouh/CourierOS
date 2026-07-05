from types import SimpleNamespace

from app.crud import shipment as shipment_crud
from app.database import Base, SessionLocal, engine
from app.models.user import User


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_soft_delete_excludes_shipments_by_default_and_allows_admin_to_include_deleted():
    db = SessionLocal()
    try:
        admin = User(username="admin-soft", email="admin-soft@example.com", hashed_password="x", role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)

        shipment = shipment_crud.create_shipment(
            db,
            type(
                "ShipmentData",
                (),
                {
                    "sender_name": "A",
                    "receiver_name": "B",
                    "receiver_phone": "12345678901",
                    "address": "1 Main",
                    "city": "Cairo",
                },
            )(),
            owner_id=admin.id,
        )

        current_user = SimpleNamespace(id=admin.id, role="admin")
        deleted = shipment_crud.delete_shipment(db, shipment.id, current_user=current_user)

        assert deleted.is_deleted is True
        assert deleted.deleted_at is not None
        assert shipment_crud.get_all_shipments(db, current_user=current_user) == []
        assert shipment_crud.get_shipment_by_id(db, shipment.id, current_user=current_user) is None
        included = shipment_crud.get_all_shipments(db, current_user=current_user, include_deleted=True)
        assert len(included) == 1
        assert included[0].id == shipment.id
    finally:
        db.close()
