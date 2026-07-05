from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

user = db.query(User).filter(User.username == "abdelrahman").first()

if user:
    user.role = "admin"
    db.commit()
    print("✅ User is now admin.")
else:
    print("❌ User not found.")

db.close()