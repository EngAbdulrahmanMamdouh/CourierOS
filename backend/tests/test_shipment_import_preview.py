import io

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # ensure SQLAlchemy metadata is loaded
from app.database import Base
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
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


def test_preview_shipment_import_detects_columns_and_validates_rows():
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
            "/imports/shipments/preview",
            files={
                "file": (
                    "import.xlsx",
                    _create_xlsx_bytes(
                        [
                            ["Sender Name", "Receiver Name", "Receiver Phone", "Address", "City", "COD Amount", "Notes"],
                            ["Alice", "Bob", "01234567890", "1 Main St", "Cairo", 100, "Leave at door"],
                            ["", "Bob", "01234567890", "1 Main St", "Cairo", 100, "Missing sender"],
                        ]
                    ),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["detected_columns"] == [
            "sender_name",
            "receiver_name",
            "receiver_phone",
            "address",
            "city",
            "cod_amount",
            "notes",
        ]
        assert data["missing_required_columns"] == []
        assert data["total_rows"] == 2
        assert data["preview_rows"][0]["validation_status"] == "valid"
        assert data["preview_rows"][1]["validation_status"] == "invalid"
        assert any("sender_name" in err for err in data["preview_rows"][1]["validation_errors"])
    finally:
        db.close()
