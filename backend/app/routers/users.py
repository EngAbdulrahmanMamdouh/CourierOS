from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.user import UserCreate, UserResponse, UserRoleUpdate, UserStatusUpdate, UserUpdate
from app.crud import user as user_crud
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.crud.user import get_all_users
from app.services.permissions import require_permission
from app.services.tenant_context import is_platform_admin

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "create", {"users.create"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create users"
        ) from exc

    user.username = (user.username or '').strip()
    user.email = (user.email or '').strip().lower()
    user.role = (user.role or 'employee').strip().lower()

    # Allow platform-scoped user creation (company_id == None) only when a
    # platform admin is explicitly creating a platform-level user (admin/super_admin).
    # This is a narrow exception that does NOT change tenant helpers or global
    # write behavior: for this path we intentionally call `create_user` with
    # `current_user=None` so the tenant guard in `require_write_company_id` is
    # bypassed only for this specific, validated case.
    if is_platform_admin(current_user):
        provided_company = getattr(user, "company_id", None)
        if provided_company is None:
            if user.role not in ("admin", "super_admin"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Platform-scoped users must be created as platform-level roles"
                )
            # For platform-level admin creation, still perform duplicate
            # username/email checks to return clean HTTP 409 responses
            # instead of letting the DB raise integrity errors.
            existing_user = user_crud.get_user_by_username(db, user.username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists"
                )

            existing_email = user_crud.get_user_by_email(db, user.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists"
                )

            # Create platform-level user without passing current_user so the
            # tenant helper is not invoked for writes. This keeps tenant
            # enforcement strict elsewhere.
            return user_crud.create_user(db, user, current_user=None)

    if current_user.role == "company_admin":
        if user.company_id is not None and user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company admin can only create users in own company"
            )
        user.company_id = current_user.company_id

    existing_user = user_crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    existing_email = user_crud.get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )

    return user_crud.create_user(db, user, current_user=current_user)

@router.get("/me")
def read_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "company_id": current_user.company_id,
    }


@router.get(
    "/all",
    response_model=list[UserResponse]
)
def read_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        require_permission(current_user, "view", {"users.view"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc
    return get_all_users(db, current_user=current_user)


@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "view", {"users.view"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc

    user = user_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role != "super_admin" and current_user.role != "admin" and current_user.role != "company_admin":
        if current_user.company_id is None or user.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="User not found")

    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "update", {"users.update"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc

    target_user = user_crud.get_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role == "company_admin":
        if target_user.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="User not found")

    if user_update.email is not None:
        existing_user = user_crud.get_user_by_email(db, user_update.email)
        if existing_user is not None and existing_user.id != target_user.id:
            raise HTTPException(status_code=400, detail="Email already exists")

    updated_user = user_crud.update_user(db, user_id, user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "delete", {"users.delete"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc

    target_user = user_crud.get_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role == "company_admin":
        if target_user.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="User not found")

    deleted = user_crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")

    return None


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
)
def change_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "update", {"users.update"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc

    target_user = user_crud.get_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role == "company_admin":
        if target_user.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="User not found")

    updated_user = user_crud.change_user_role(db, user_id, role_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def change_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        require_permission(current_user, "update", {"users.update"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized"
        ) from exc

    target_user = user_crud.get_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role == "company_admin":
        if target_user.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="User not found")

    updated_user = user_crud.change_user_status(db, user_id, status_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user