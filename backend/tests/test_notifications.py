import pytest

from app.database import Base, SessionLocal, engine
from app.models.notification import Notification
from app.models.user import User
from app.routers.notifications import get_notifications
from app.services.notification_service import create_notification, get_user_notifications, mark_all_as_read, mark_as_read


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


def test_notification_service_marks_notifications_as_read():
    db = SessionLocal()
    try:
        employee = User(username="emp-notify-2", email="emp-notify-2@example.com", hashed_password="x", role="employee")
        db.add(employee)
        db.commit()
        db.refresh(employee)

        first = create_notification(db=db, user_id=employee.id, message="First", current_user=employee)
        second = create_notification(db=db, user_id=employee.id, message="Second", current_user=employee)

        updated = mark_as_read(db=db, notification_id=first.id, current_user=employee)
        assert updated is not None
        assert updated.is_read is True

        notifications = get_user_notifications(db=db, user_id=employee.id)
        assert len(notifications) == 2
        assert any(item.id == first.id and item.is_read for item in notifications)
        assert any(item.id == second.id and not item.is_read for item in notifications)

        mark_all_as_read(db=db, user_id=employee.id, current_user=employee)
        notifications = get_user_notifications(db=db, user_id=employee.id)
        assert all(item.is_read for item in notifications)
    finally:
        db.close()


def test_notification_service_enforces_authorization():
    db = SessionLocal()
    try:
        admin = User(username="admin-notify", email="admin-notify@example.com", hashed_password="x", role="admin", company_id=1)
        company_admin = User(username="company-admin", email="company-admin@example.com", hashed_password="x", role="company_admin", company_id=10)
        employee = User(username="employee-notify", email="employee-notify@example.com", hashed_password="x", role="employee", company_id=10)
        other_employee = User(username="other-employee", email="other-employee-2@example.com", hashed_password="x", role="employee", company_id=20)
        db.add_all([admin, company_admin, employee, other_employee])
        db.commit()
        db.refresh(admin)
        db.refresh(company_admin)
        db.refresh(employee)
        db.refresh(other_employee)

        create_notification(db=db, user_id=employee.id, message="Allowed", current_user=admin)
        create_notification(db=db, user_id=employee.id, message="Allowed for same company", current_user=company_admin)

        with pytest.raises(PermissionError):
            create_notification(db=db, user_id=other_employee.id, message="Forbidden", current_user=employee)

        with pytest.raises(PermissionError):
            create_notification(db=db, user_id=other_employee.id, message="Forbidden", current_user=company_admin)
    finally:
        db.close()
