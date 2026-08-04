from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserRoleUpdate, UserStatusUpdate, UserUpdate
from app.security import hash_password


def _normalize_lookup_value(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip().lower()


def get_user_by_username(db: Session, username: str):
    normalized_username = _normalize_lookup_value(username)
    if normalized_username is None:
        return None

    return db.query(User).filter(
        func.lower(User.username) == normalized_username
    ).first()


def create_user(db: Session, user: UserCreate):
    username = (user.username or '').strip()
    email = (user.email or '').strip().lower()
    role = (getattr(user, 'role', 'employee') or 'employee').strip().lower()

    new_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(user.password),
        role=role,
        company_id=user.company_id,
        full_name=(getattr(user, 'full_name', None) or '').strip() or None,
        phone=(getattr(user, 'phone', None) or '').strip() or None,
        is_active=getattr(user, 'is_active', True),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    normalized_email = _normalize_lookup_value(email)
    if normalized_email is None:
        return None

    return db.query(User).filter(func.lower(User.email) == normalized_email).first()


def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = get_user_by_id(db, user_id)
    if user is None:
        return None

    update_data = user_update.model_dump(exclude_unset=True) if hasattr(user_update, "model_dump") else user_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if user is None:
        return False

    db.delete(user)
    db.commit()
    return True


def change_user_role(db: Session, user_id: int, role_update: UserRoleUpdate):
    user = get_user_by_id(db, user_id)
    if user is None:
        return None

    user.role = role_update.role
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def change_user_status(db: Session, user_id: int, status_update: UserStatusUpdate):
    user = get_user_by_id(db, user_id)
    if user is None:
        return None

    user.is_active = status_update.is_active
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session, current_user: User | None = None):
    query = db.query(User)

    if current_user is not None and current_user.role != "admin":
        if current_user.company_id is None:
            return []
        query = query.filter(User.company_id == current_user.company_id)

    return query.all()