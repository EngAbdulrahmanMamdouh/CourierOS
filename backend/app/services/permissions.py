from app.services.rbac import has_permission, normalize_role, resolve_role_permissions
from app.services.tenant_context import get_current_company_id, is_platform_admin, require_company_context


def require_permission(current_user, action: str, allowed_actions: set[str]):
    if current_user is None:
        raise PermissionError("Not authorized")

    role = getattr(current_user, "role", None)
    normalized_role = normalize_role(role)

    if normalized_role in {"super_admin", "admin"}:
        return

    if normalized_role == "company_admin" and action in allowed_actions:
        return

    if normalized_role == "employee" and action in {"view", "read"}:
        return

    if normalized_role == "user":
        raise PermissionError("Not authorized")

    if action in allowed_actions:
        return

    raise PermissionError("Not authorized")


def require_permission_by_name(current_user, permission: str):
    if has_permission(current_user, permission):
        return
    raise PermissionError("Not authorized")


def get_effective_permissions(current_user) -> set[str]:
    role = getattr(current_user, "role", None)
    return resolve_role_permissions(role)
