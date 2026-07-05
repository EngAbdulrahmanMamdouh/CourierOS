from datetime import datetime
from types import SimpleNamespace

import pytest

from app.crud import payment as payment_crud
from app.database import Base, SessionLocal, engine
from app.models.cod import COD
from app.models.customer import Customer
from app.models.shipment import Shipment
from app.models.user import User


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_payment_crud_validation_permissions_and_soft_delete():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=None)
        employee = SimpleNamespace(id=2, role="employee", company_id=1)
        regular_user = SimpleNamespace(id=3, role="user", company_id=1)

        customer = Customer(full_name="Alice", phone="01000000000", email="alice@example.com", company_name="Acme", address="Cairo", city="Cairo", notes="", is_active=True, company_id=1)
        db.add(customer)

        shipment = Shipment(sender_name="A", receiver_name="B", receiver_phone="01111111111", address="Somewhere", city="Cairo", owner_id=1, status="Pending")
        db.add(shipment)
        db.commit()
        db.refresh(customer)
        db.refresh(shipment)

        cod = COD(shipment_id=shipment.id, amount=120.0, currency="EGP", collected=True, collected_at=datetime.fromisoformat("2026-07-01T10:00:00"), collected_by_driver_id=5, transferred_to_customer=False, notes="Test", is_deleted=False)
        db.add(cod)
        db.commit()
        db.refresh(cod)

        with pytest.raises(ValueError):
            payment_crud.create_payment(
                db=db,
                payment_data=SimpleNamespace(
                    shipment_id=None,
                    cod_id=None,
                    customer_id=customer.id,
                    amount=100.0,
                    currency="EGP",
                    payment_method="Cash",
                    payment_status="Paid",
                    transaction_reference="TRX001",
                    paid_at=None,
                    notes="",
                ),
                current_user=admin,
            )

        with pytest.raises(ValueError):
            payment_crud.create_payment(
                db=db,
                payment_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    cod_id=None,
                    customer_id=customer.id,
                    amount=0,
                    currency="EGP",
                    payment_method="Cash",
                    payment_status="Paid",
                    transaction_reference="TRX002",
                    paid_at=None,
                    notes="",
                ),
                current_user=admin,
            )

        payment = payment_crud.create_payment(
            db=db,
            payment_data=SimpleNamespace(
                shipment_id=shipment.id,
                cod_id=None,
                customer_id=customer.id,
                amount=100.0,
                currency="EGP",
                payment_method="Cash",
                payment_status="Paid",
                transaction_reference="TRX003",
                paid_at="2026-07-01T12:00:00",
                notes="Payment created",
            ),
            current_user=admin,
        )
        assert payment.amount == 100.0

        with pytest.raises(ValueError):
            payment_crud.create_payment(
                db=db,
                payment_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    cod_id=None,
                    customer_id=customer.id,
                    amount=150.0,
                    currency="EGP",
                    payment_method="Cash",
                    payment_status="Paid",
                    transaction_reference="TRX003",
                    paid_at="2026-07-01T13:00:00",
                    notes="Duplicate reference",
                ),
                current_user=admin,
            )

        payment = payment_crud.create_payment(
            db=db,
            payment_data=SimpleNamespace(
                shipment_id=None,
                cod_id=cod.id,
                customer_id=customer.id,
                amount=120.0,
                currency="EGP",
                payment_method="Bank Transfer",
                payment_status="Paid",
                transaction_reference="TRX004",
                paid_at="2026-07-01T14:00:00",
                notes="COD payment",
            ),
            current_user=admin,
        )
        assert payment.payment_method == "Bank Transfer"

        payments = payment_crud.get_all_payments(db=db, page=1, size=10, current_user=employee)
        assert len(payments) == 2

        with pytest.raises(PermissionError):
            payment_crud.create_payment(
                db=db,
                payment_data=SimpleNamespace(
                    shipment_id=shipment.id,
                    cod_id=None,
                    customer_id=customer.id,
                    amount=100.0,
                    currency="EGP",
                    payment_method="Cash",
                    payment_status="Paid",
                    transaction_reference="TRX005",
                    paid_at="2026-07-01T15:00:00",
                    notes="",
                ),
                current_user=regular_user,
            )

        deleted = payment_crud.delete_payment(db=db, payment_id=payment.id, current_user=admin)
        assert deleted.is_deleted is True

        assert payment_crud.get_payment_by_id(db=db, payment_id=payment.id, current_user=admin) is None
    finally:
        db.close()
