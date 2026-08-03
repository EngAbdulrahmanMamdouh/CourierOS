from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud import user as user_crud
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.crud.user import get_all_users
from app.services.permissions import require_permission

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
    existing_user = user_crud.get_user_by_username(
        db,
        user.username
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    try:
        require_permission(current_user, "create", {"users.create"})
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create users"
        ) from exc

    if current_user.role == "company_admin":
        if user.company_id is not None and user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company admin can only create users in own company"
            )
        user.company_id = current_user.company_id

    return user_crud.create_user(db, user)

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