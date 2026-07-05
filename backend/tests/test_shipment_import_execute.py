import io
from datetime import datetime

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


def test_execute_shipment_import_success_and_duplicates():
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
            "/imports/shipments/execute",
            files={
                "file": (
                    "import.xlsx",
                    _create_xlsx_bytes(
                        [
                            ["sender_name", "receiver_name", "receiver_phone", "address", "city"],
                            ["Alice", "Bob", "01234567890", "1 Main St", "Cairo"],
                            ["Alice", "Bob", "01234567890", "1 Main St", "Cairo"],
                            ["", "Bob", "01234567890", "1 Main St", "Cairo"],
                        ]
                    ),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_rows"] == 3
        assert data["successful_rows"] == 1
        assert data["duplicate_rows"] == 1
        assert data["failed_rows"] == 2
        assert len(data["validation_errors"]) == 1
        assert len(data["created_shipment_ids"]) == 1
        assert data["execution_time"] >= 0
        assert data["import_job_id"] is not None
    finally:
        db.close()


def test_execute_shipment_import_empty_file():
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
            "/imports/shipments/execute",
            files={
                "file": (
                    "import.xlsx",
                    _create_xlsx_bytes([]),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_rows"] == 0
        assert data["successful_rows"] == 0
        assert data["failed_rows"] == 0
        assert data["duplicate_rows"] == 0
        assert data["validation_errors"] == []
        assert data["created_shipment_ids"] == []
    finally:
        db.close()
