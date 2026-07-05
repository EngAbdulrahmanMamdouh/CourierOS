from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.crud import shipment as shipment_crud
from app.models.shipment import Shipment
from app.models.user import User
from app.routers.shipments import dashboard_summary


def test_dashboard_summary_returns_role_scoped_data():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        admin = User(username="admin", email="admin@example.com", hashed_password="x", role="admin")
        employee = User(username="emp", email="emp@example.com", hashed_password="x", role="employee")
        user = User(username="user", email="user@example.com", hashed_password="x", role="employee")
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

        result = dashboard_summary(db=db, current_user=user)

        assert result["total_shipments"] == 1
        assert result["total_users"] == 3
        assert len(result["recent_shipments"]) == 1
    finally:
        db.close()
