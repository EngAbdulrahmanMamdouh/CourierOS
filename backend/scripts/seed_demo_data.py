import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app.database import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.security import hash_password


def get_company_by_code(db, code: str):
    return db.query(Company).filter(Company.code == code).first()


def get_user_by_username(db, username: str):
    return db.query(User).filter(User.username == username).first()


def main():
    session = SessionLocal()
    result = {
        "company": "Existing",
        "users": {
            "superadmin": "Existing",
            "companyadmin": "Existing",
            "employee": "Existing",
        },
    }

    demo_company_data = {
        "name": "CourierOS Demo",
        "code": "DEMO",
        "email": "demo@courieros.com",
        "phone": "+1 555 123 4567",
        "address": "123 CourierOS Way",
        "city": "Demo City",
        "country": "Demo Country",
        "tax_number": "DEMO-12345",
        "commercial_register": "DEMO-REG-001",
        "logo_url": None,
        "subscription_plan": "enterprise",
        "subscription_status": "active",
        "is_active": True,
    }

    demo_users = [
        {
            "username": "superadmin",
            "email": "superadmin@demo.courieros.com",
            "role": "super_admin",
        },
        {
            "username": "companyadmin",
            "email": "companyadmin@demo.courieros.com",
            "role": "company_admin",
        },
        {
            "username": "employee",
            "email": "employee@demo.courieros.com",
            "role": "employee",
        },
    ]

    try:
        company = get_company_by_code(session, demo_company_data["code"])
        if company is None:
            company = Company(**demo_company_data)
            session.add(company)
            session.commit()
            session.refresh(company)
            result["company"] = "Created"

        for demo_user in demo_users:
            user = get_user_by_username(session, demo_user["username"])
            if user is None:
                new_user = User(
                    username=demo_user["username"],
                    email=demo_user["email"],
                    hashed_password=hash_password("Courier@123"),
                    role=demo_user["role"],
                    company_id=company.id,
                )
                session.add(new_user)
                session.commit()
                result["users"][demo_user["username"]] = "Created"
            else:
                result["users"][demo_user["username"]] = "Existing"

    except Exception as exc:
        session.rollback()
        print("Error: Failed to seed demo data.")
        print(f"Details: {exc}")
        raise

    finally:
        session.close()

    print("=================================")
    print("CourierOS Demo Seed Completed")
    print("=================================")
    print("\nCompany:")
    print(f"- {result['company']}")
    print("\nUsers:")
    for username, status in result["users"].items():
        print(f"- {username} ({status})")
    print("\nDemo credentials:\n")
    print("superadmin")
    print("Password: Courier@123\n")
    print("companyadmin")
    print("Password: Courier@123\n")
    print("employee")
    print("Password: Courier@123\n")
    print("=================================")


if __name__ == "__main__":
    main()
