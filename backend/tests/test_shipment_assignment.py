from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.crud import shipment as shipment_crud
from app.models.shipment import Shipment
from app.models.user import User


def test_assign_shipment_to_employee():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        admin = User(username="admin3", email="admin3@example.com", hashed_password="x", role="admin")
        employee = User(username="employee3", email="employee3@example.com", hashed_password="x", role="employee")
        db.add_all([admin, employee])
        db.commit()
        db.refresh(admin)
        db.refresh(employee)

        shipment = Shipment(
            sender_name="A",
            receiver_name="B",
            receiver_phone="12345678901",
            address="1 Main",
            city="Cairo",
            status="Pending",
            owner_id=admin.id,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        updated = shipment_crud.assign_shipment(db, shipment.id, employee.id, current_user=admin)

        assert updated.assigned_to == employee.id
    finally:
        db.close()
