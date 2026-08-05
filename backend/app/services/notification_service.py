from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User
from app.services.tenant_context import is_platform_admin


def create_notification(db: Session, user_id: int, message: str, is_read: bool = False, current_user: User | None = None) -> Notification:
    if current_user is not None:
        if is_platform_admin(current_user):
            pass
        elif getattr(current_user, "role", None) == "company_admin":
            target_user = db.query(User).filter(User.id == user_id).first()
            if target_user is None or target_user.company_id != current_user.company_id:
                raise PermissionError("Company admin can only create notifications for users in the same company")
        else:
            if user_id != current_user.id:
                raise PermissionError("Regular users can only create notifications for themselves")

    notification = Notification(user_id=user_id, message=message, is_read=is_read)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_user_notifications(db: Session, user_id: int, include_read: bool = True):
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if not include_read:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()


def mark_as_read(db: Session, notification_id: int, current_user: User | None = None):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        return None

    if current_user is not None and not is_platform_admin(current_user) and notification.user_id != current_user.id:
        return None

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, user_id: int, current_user: User | None = None):
    query = db.query(Notification).filter(Notification.user_id == user_id)

    if current_user is not None and not is_platform_admin(current_user) and user_id != current_user.id:
        return 0

    notifications = query.all()
    for notification in notifications:
        notification.is_read = True

    db.commit()
    return len(notifications)
