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


def test_download_templates():
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

        for template in ["shipments", "customers", "drivers", "branches"]:
            response = client.get(f"/imports/templates/{template}")
            assert response.status_code == 200
            assert response.headers["content-type"].startswith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    finally:
        db.close()


def test_download_error_and_duplicate_reports():
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
        job_id = data["import_job_id"]

        summary_response = client.get(f"/imports/{job_id}/summary")
        assert summary_response.status_code == 200
        summary = summary_response.json()
        assert summary["total_rows"] == 3
        assert summary["duplicate_rows"] == 1
        assert summary["imported_rows"] == 1

        error_report_response = client.get(f"/imports/{job_id}/error-report")
        assert error_report_response.status_code == 200
        assert error_report_response.headers["content-disposition"].startswith("attachment;")

        duplicate_report_response = client.get(f"/imports/{job_id}/duplicate-report")
        assert duplicate_report_response.status_code == 200
        assert duplicate_report_response.headers["content-disposition"].startswith("attachment;")
    finally:
        db.close()


def test_large_import_performance():
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

        rows = [["sender_name", "receiver_name", "receiver_phone", "address", "city"]]
        for i in range(500):
            rows.append([f"Sender{i}", f"Receiver{i}", f"01{i:09d}", f"Address {i}", "Cairo"])
        rows.append(["", "ReceiverBad", "01234567890", "Address Bad", "Cairo"])

        response = client.post(
            "/imports/shipments/execute",
            files={
                "file": (
                    "import.xlsx",
                    _create_xlsx_bytes(rows),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_rows"] == 501
        assert data["successful_rows"] == 500
        assert data["failed_rows"] == 1
        assert data["duplicate_rows"] == 0
    finally:
        db.close()
