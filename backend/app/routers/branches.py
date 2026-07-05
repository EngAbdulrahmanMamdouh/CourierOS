from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import branch as branch_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchResponse, BranchUpdate

router = APIRouter(
    prefix="/branches",
    tags=["Branches"],
)


@router.get("/", response_model=list[BranchResponse])
def get_branches(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return branch_crud.get_all_branches(
            db=db,
            page=page,
            size=size,
            current_user=current_user,
            search=search,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.get("/{branch_id}", response_model=BranchResponse)
def get_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        branch = branch_crud.get_branch_by_id(db, branch_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.post("/", response_model=BranchResponse)
def create_branch(
    branch: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return branch_crud.create_branch(db, branch, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.put("/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: int,
    branch: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = branch_crud.update_branch(db, branch_id, branch, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return updated


@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        deleted = branch_crud.delete_branch(db, branch_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="Branch not found")

    return {"message": "Branch deleted successfully"}
