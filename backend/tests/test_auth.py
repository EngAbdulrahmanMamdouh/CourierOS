from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.security import verify_password
from main import ensure_default_users


def test_ensure_default_users_repairs_placeholder_password_hash():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        user = User(
            username="admin-soft",
            email="admin-soft@example.com",
            hashed_password="x",
            role="employee",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        ensure_default_users(db)

        db.refresh(user)
        assert user.role == "admin"
        assert verify_password("Courier@123", user.hashed_password)
    finally:
        db.close()
