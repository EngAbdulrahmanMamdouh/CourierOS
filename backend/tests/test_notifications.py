from app.database import Base, SessionLocal, engine
from app.models.notification import Notification
from app.models.user import User
from app.routers.notifications import get_notifications


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_employee_sees_only_their_own_notifications():
    db = SessionLocal()
    try:
        employee = User(username="emp-notify", email="emp-notify@example.com", hashed_password="x", role="employee")
        second_employee = User(username="second-notify", email="second-notify@example.com", hashed_password="x", role="employee")
        db.add_all([employee, second_employee])
        db.commit()
        db.refresh(employee)
        db.refresh(second_employee)

        db.add_all([
            Notification(user_id=employee.id, message="Assigned shipment"),
            Notification(user_id=second_employee.id, message="Pickup reminder"),
        ])
        db.commit()

        payload = get_notifications(db=db, current_user=employee)
        assert len(payload) == 1
        assert payload[0].user_id == employee.id
        assert payload[0].message == "Assigned shipment"
    finally:
        db.close()
