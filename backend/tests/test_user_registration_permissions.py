from types import SimpleNamespace
from uuid import uuid4

from fastapi.testclient import TestClient

import main
from app.dependencies import auth as auth_dependency


def test_admin_can_register_user_with_platform_context():
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=1,
        username="admin-soft",
        email="admin-soft@example.com",
        role="admin",
        company_id=None,
        is_active=True,
    )

    unique_username = f"admin-probe-{uuid4().hex[:8]}"

    with TestClient(app) as client:
        response = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": None,
                "full_name": "Admin Probe",
                "phone": "1234567890",
                "role": "employee",
            },
        )

    app.dependency_overrides.clear()

    # Platform admin may NOT create an `employee` without a company context.
    assert response.status_code == 403


def test_admin_can_register_platform_admin_with_platform_context():
    """Platform admin may create platform-level admins without company_id."""
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=1,
        username="admin-soft",
        email="admin-soft@example.com",
        role="admin",
        company_id=None,
        is_active=True,
    )

    unique_username = f"admin-probe-{uuid4().hex[:8]}"

    with TestClient(app) as client:
        response = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": None,
                "full_name": "Admin Probe",
                "phone": "1234567890",
                "role": "admin",
            },
        )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["username"] == unique_username


def test_company_admin_can_register_user_only_in_own_company():
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=2,
        username="company-admin",
        email="company-admin@example.com",
        role="company_admin",
        company_id=7,
        is_active=True,
    )

    unique_username = f"tenant-user-{uuid4().hex[:8]}"

    with TestClient(app) as client:
        response = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": 7,
                "full_name": "Tenant User",
                "phone": "1234567890",
                "role": "employee",
            },
        )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["company_id"] == 7
    assert response.json()["role"] == "employee"


def test_company_admin_cannot_register_user_for_other_company():
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=2,
        username="company-admin",
        email="company-admin@example.com",
        role="company_admin",
        company_id=7,
        is_active=True,
    )

    unique_username = f"other-company-user-{uuid4().hex[:8]}"

    with TestClient(app) as client:
        response = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": 99,
                "full_name": "Other Tenant",
                "phone": "1234567890",
                "role": "employee",
            },
        )

    app.dependency_overrides.clear()

    assert response.status_code == 403
    assert "own company" in response.json()["detail"].lower()


def test_employee_cannot_register_user():
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=3,
        username="employee-user",
        email="employee-user@example.com",
        role="employee",
        company_id=7,
        is_active=True,
    )

    unique_username = f"employee-block-{uuid4().hex[:8]}"

    with TestClient(app) as client:
        response = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": 7,
                "full_name": "Blocked Employee",
                "phone": "1234567890",
                "role": "employee",
            },
        )

    app.dependency_overrides.clear()

    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()


def test_duplicate_username_and_email_are_blocked():
    app = main.app
    app.dependency_overrides[auth_dependency.get_current_user] = lambda: SimpleNamespace(
        id=1,
        username="admin-soft",
        email="admin-soft@example.com",
        role="admin",
        company_id=None,
        is_active=True,
    )

    unique_username = f"duplicate-probe-{uuid4().hex[:8]}"
    unique_email = f"{unique_username}@example.com"

    with TestClient(app) as client:
        # Create a platform-level admin (allowed)
        first = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": unique_email,
                "password": "StrongPass123",
                "company_id": None,
                "full_name": "Duplicate Probe",
                "phone": "1234567890",
                "role": "admin",
            },
        )

        assert first.status_code == 200

        # Attempt to create another user with same username (different email)
        duplicate_username = client.post(
            "/users/register",
            json={
                "username": unique_username,
                "email": f"different-{unique_username}@example.com",
                "password": "StrongPass123",
                "company_id": None,
                "full_name": "Duplicate Username",
                "phone": "1234567890",
                "role": "admin",
            },
        )

        duplicate_email = client.post(
            "/users/register",
            json={
                "username": f"another-{unique_username}",
                "email": unique_email,
                "password": "StrongPass123",
                "company_id": None,
                "full_name": "Duplicate Email",
                "phone": "1234567890",
                "role": "admin",
            },
        )

    app.dependency_overrides.clear()

    assert duplicate_username.status_code == 409
    assert "username" in duplicate_username.json()["detail"].lower()
    assert duplicate_email.status_code == 409
    assert "email" in duplicate_email.json()["detail"].lower()
