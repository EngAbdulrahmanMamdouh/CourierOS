from __future__ import annotations

from typing import Iterable

PERMISSION_DEFINITIONS = {
    "users.view": "View users",
    "users.create": "Create users",
    "users.update": "Update users",
    "users.delete": "Delete users",
    "companies.view": "View companies",
    "companies.manage": "Manage companies",
    "shipments.view": "View shipments",
    "shipments.create": "Create shipments",
    "shipments.update": "Update shipments",
    "shipments.delete": "Delete shipments",
    "shipments.assign_driver": "Assign drivers to shipments",
    "customers.view": "View customers",
    "customers.manage": "Manage customers",
    "finance.view": "View finance data",
    "finance.manage": "Manage finance data",
    "reports.view": "View reports",
}


def _all_permissions() -> set[str]:
    return set(PERMISSION_DEFINITIONS.keys())


ROLE_PERMISSIONS = {
    "super_admin": _all_permissions(),
    "company_admin": {
        "users.view",
        "users.create",
        "users.update",
        "companies.view",
        "companies.manage",
        "shipments.view",
        "shipments.create",
        "shipments.update",
        "shipments.assign_driver",
        "customers.view",
        "customers.manage",
        "finance.view",
        "finance.manage",
        "reports.view",
    },
    "branch_manager": {
        "shipments.view",
        "shipments.create",
        "shipments.update",
        "shipments.assign_driver",
        "customers.view",
        "customers.manage",
        "reports.view",
        "finance.view",
    },
    "dispatcher": {
        "shipments.view",
        "shipments.create",
        "shipments.update",
        "shipments.assign_driver",
        "customers.view",
        "reports.view",
    },
    "driver": {
        "shipments.view",
        "shipments.update",
    },
    "employee": {
        "shipments.view",
        "customers.view",
        "reports.view",
    },
    "admin": _all_permissions(),
    "user": set(),
}


def normalize_role(role: str | None) -> str:
    if role is None:
        return "user"

    normalized = (role or "").strip().lower()
    role_aliases = {
        "super_admin": "super_admin",
        "platform_admin": "super_admin",
        "admin": "super_admin",
        "company_admin": "company_admin",
        "branch_manager": "branch_manager",
        "dispatcher": "dispatcher",
        "driver": "driver",
        "employee": "employee",
        "user": "user",
    }
    return role_aliases.get(normalized, normalized)


def resolve_role_permissions(role: str | None) -> set[str]:
    normalized = normalize_role(role)
    return set(ROLE_PERMISSIONS.get(normalized, set()))


def has_permission(current_user, permission: str | None) -> bool:
    if current_user is None or permission is None:
        return False

    role = getattr(current_user, "role", None)
    allowed_permissions = resolve_role_permissions(role)
    return permission in allowed_permissions


def get_available_permissions() -> Iterable[str]:
    return sorted(PERMISSION_DEFINITIONS.keys())
