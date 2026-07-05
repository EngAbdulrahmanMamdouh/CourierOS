from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.crud import shipment as shipment_crud
from app.models.user import User
from app.routers.shipments import reports_shipments


def test_reports_shipments_filters_by_role_and_status():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        admin = User(username="admin2", email="admin2@example.com", hashed_password="x", role="admin")
        employee = User(username="emp2", email="emp2@example.com", hashed_password="x", role="employee")
        user = User(username="user2", email="user2@example.com", hashed_password="x", role="employee")
        db.add_all([admin, employee, user])
        db.commit()
        db.refresh(admin)
        db.refresh(employee)
        db.refresh(user)

        shipment_crud.create_shipment(
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
            owner_id=user.id,
        )
        shipment_crud.create_shipment(
            db,
            type(
                "ShipmentData",
                (),
                {
                    "sender_name": "C",
                    "receiver_name": "D",
                    "receiver_phone": "12345678901",
                    "address": "2 Main",
                    "city": "Alex",
                },
            )(),
            owner_id=employee.id,
        )

        result = reports_shipments(db=db, current_user=user, status="Pending")

        assert result["total_shipments"] == 1
        assert result["grouped_counts"]["Pending"] == 1
        assert len(result["shipments"]) == 1
    finally:
        db.close()
