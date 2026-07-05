import io

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
import app.models  # ensure all SQLAlchemy models are registered with metadata
from app.models.user import User
from app.routers.shipment_imports import router as shipment_import_router


def _create_xlsx_bytes(rows):
    from openpyxl import Workbook

    workbook = Workbook()
    sheet = workbook.active
    for row in rows:
        sheet.append(row)
    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)
    return output.read()


def test_upload_shipment_excel_creates_import_job():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(shipment_import_router)

    db = TestingSessionLocal()
    try:
        user = User(username="admin", email="admin@example.com", hashed_password="x", role="admin")
        db.add(user)
        db.commit()
        db.refresh(user)

        app.dependency_overrides[get_db] = lambda: db
        app.dependency_overrides[get_current_user] = lambda: user

        client = TestClient(app)

        response = client.post(
            "/imports/shipments/upload",
            files={
                "file": (
                    "import.xlsx",
                    _create_xlsx_bytes([["sender_name", "receiver_name", "receiver_phone", "address", "city"], ["Alice", "Bob", "01234567890", "1 Main St", "Cairo"]]),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["file_name"] == "import.xlsx"
        assert data["status"] == "Uploaded"
        assert data["total_rows"] >= 1
    finally:
        db.close()
