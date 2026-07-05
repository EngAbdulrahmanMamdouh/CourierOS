from types import SimpleNamespace

import pytest

from app.crud import cod as cod_crud
from app.database import Base, SessionLocal, engine
from app.models.shipment import Shipment
from app.models.user import User


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_cod_crud_validation_soft_delete_and_permissions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin")
        employee = SimpleNamespace(id=2, role="employee")
        regular_user = SimpleNamespace(id=3, role="user")

        shipment = Shipment(
            sender_name="A",
            receiver_name="B",
            receiver_phone="123",
            address="Address",
            city="Cairo",
            owner_id=1,
            status="Pending",
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        with pytest.raises(ValueError):
            cod_crud.create_cod(
                db=db,
                cod_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    amount=-5,
                    currency="EGP",
                    collected=False,
                    collected_at=None,
                    collected_by_driver_id=None,
                    transferred_to_customer=False,
                    transferred_at=None,
                    notes="",
                    is_deleted=False,
                ),
                current_user=admin,
            )

        cod = cod_crud.create_cod(
            db=db,
            cod_data=SimpleNamespace(
                shipment_id=shipment.id,
                amount=150.0,
                currency="EGP",
                collected=False,
                collected_at=None,
                collected_by_driver_id=None,
                transferred_to_customer=False,
                transferred_at=None,
                notes="",
                is_deleted=False,
            ),
            current_user=admin,
        )
        assert cod.amount == 150.0

        with pytest.raises(ValueError):
            cod_crud.create_cod(
                db=db,
                cod_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    amount=200.0,
                    currency="EGP",
                    collected=False,
                    collected_at=None,
                    collected_by_driver_id=None,
                    transferred_to_customer=False,
                    transferred_at=None,
                    notes="",
                    is_deleted=False,
                ),
                current_user=admin,
            )

        updated = cod_crud.update_cod(
            db=db,
            cod_id=cod.id,
            cod_data=SimpleNamespace(
                shipment_id=shipment.id,
                amount=150.0,
                currency="EGP",
                collected=True,
                collected_at="2026-07-01T10:00:00",
                collected_by_driver_id=7,
                transferred_to_customer=False,
                transferred_at=None,
                notes="Collected",
                is_deleted=False,
            ),
            current_user=admin,
        )
        assert updated.collected is True

        with pytest.raises(ValueError):
            cod_crud.update_cod(
                db=db,
                cod_id=cod.id,
                cod_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    amount=150.0,
                    currency="EGP",
                    collected=False,
                    collected_at=None,
                    collected_by_driver_id=None,
                    transferred_to_customer=True,
                    transferred_at=None,
                    notes="",
                    is_deleted=False,
                ),
                current_user=admin,
            )

        results = cod_crud.get_all_cods(db=db, page=1, size=10, current_user=employee)
        assert len(results) == 1

        with pytest.raises(PermissionError):
            cod_crud.create_cod(
                db=db,
                cod_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    amount=100.0,
                    currency="EGP",
                    collected=False,
                    collected_at=None,
                    collected_by_driver_id=None,
                    transferred_to_customer=False,
                    transferred_at=None,
                    notes="",
                    is_deleted=False,
                ),
                current_user=regular_user,
            )

        deleted = cod_crud.delete_cod(db=db, cod_id=cod.id, current_user=admin)
        assert deleted is not None
        assert deleted.is_deleted is True

        assert cod_crud.get_cod_by_id(db=db, cod_id=cod.id, current_user=admin) is None
    finally:
        db.close()
