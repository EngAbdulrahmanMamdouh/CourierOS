def require_permission(current_user, action: str, allowed_actions: set[str]):
    if current_user is None:
        raise PermissionError("Not authorized")

    role = getattr(current_user, "role", None)
    if role == "admin":
        return

    if role == "company_admin" and action in allowed_actions:
        return

    # Employees can only view/read
    if role == "employee" and action in {"view", "read"}:
        return

    # User role has no permissions
    if role == "user":
        raise PermissionError("Not authorized")

    raise PermissionError("Not authorized")
