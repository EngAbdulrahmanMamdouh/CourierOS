from __future__ import annotations

from app.services.rbac import normalize_role


def is_platform_admin(current_user) -> bool:
    """Return True for platform-level administrators.

    This helper keeps compatibility with the existing role names used by the
    project (admin, company_admin, employee, user) while normalizing them to
    the shared RBAC role model.
    """
    if current_user is None:
        return False

    role = getattr(current_user, "role", None)
    normalized_role = normalize_role(role)
    return normalized_role in {"super_admin", "admin"}


def get_current_company_id(current_user) -> int | None:
    """Resolve the active company context for the current user.

    Usage notes:
    - Tenant-scoped users (company_admin, employee, user) must have a company_id.
    - Platform-level admins are allowed elevated access and may not need a tenant
      context for certain operations.
    - This helper is intentionally a foundation layer; existing CRUD checks remain
      unchanged until they are migrated to use it explicitly.
    """
    if current_user is None:
        raise PermissionError("Authentication required")

    if is_platform_admin(current_user):
        return getattr(current_user, "company_id", None)

    company_id = getattr(current_user, "company_id", None)
    if company_id is not None:
        return company_id

    raise PermissionError("Company context required for this operation")


def require_company_context(current_user) -> int:
    """Return the resolved company_id or raise a clear authorization error.

    This is the helper that should be called by future tenant-aware CRUD/service
    logic before applying tenant filters or performing tenant-scoped writes.
    """
    company_id = get_current_company_id(current_user)
    if company_id is None:
        raise PermissionError("Company context required for this operation")
    return company_id


def require_write_company_id(current_user, provided_company_id: int | None = None) -> int:
    """Resolve the company_id to use for tenant-scoped write operations.

    Rules:
    - If the current user is a platform admin, use the explicitly supplied
      `provided_company_id` when present, otherwise fall back to the admin's
      own assigned `company_id` if available.
    - If the current user is tenant-scoped, ignore any provided company id and
      use the current user's company via `require_company_context`.
    - Raises PermissionError if no company context is available.
    """
    if current_user is None:
        raise PermissionError("Authentication required")

    if is_platform_admin(current_user):
        if provided_company_id is not None:
            return provided_company_id
        company_id = getattr(current_user, "company_id", None)
        if company_id is None:
            raise PermissionError("Company context required for this operation")
        return company_id

    return require_company_context(current_user)
