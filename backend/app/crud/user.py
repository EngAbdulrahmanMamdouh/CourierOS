from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.security import hash_password


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(
        User.username == username
    ).first()


def create_user(db: Session, user: UserCreate):
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="employee",
        company_id=user.company_id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_all_users(db: Session, current_user: User | None = None):
    query = db.query(User)

    if current_user is not None and current_user.role != "admin":
        if current_user.company_id is None:
            return []
        query = query.filter(User.company_id == current_user.company_id)

    return query.all()