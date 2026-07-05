from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import pickup_request as pickup_request_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.pickup_request import (
    PickupRequestCreate,
    PickupRequestResponse,
    PickupRequestStatusUpdate,
    PickupRequestUpdate,
)

router = APIRouter(
    prefix="/pickup-requests",
    tags=["Pickup Requests"],
)


@router.get("/", response_model=list[PickupRequestResponse])
def get_pickup_requests(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return pickup_request_crud.get_all_pickup_requests(
            db=db,
            page=page,
            size=size,
            current_user=current_user,
            search=search,
            include_deleted=include_deleted,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.get("/{request_id}", response_model=PickupRequestResponse)
def get_pickup_request(
    request_id: int,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        pickup_request = pickup_request_crud.get_pickup_request_by_id(
            db=db,
            request_id=request_id,
            current_user=current_user,
            include_deleted=include_deleted,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    if pickup_request is None:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    return pickup_request


@router.post("/", response_model=PickupRequestResponse)
def create_pickup_request(
    pickup_request: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return pickup_request_crud.create_pickup_request(db, pickup_request, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.put("/{request_id}", response_model=PickupRequestResponse)
def update_pickup_request(
    request_id: int,
    pickup_request: PickupRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = pickup_request_crud.update_pickup_request(
            db,
            request_id,
            pickup_request,
            current_user=current_user,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    return updated


@router.patch("/{request_id}/status")
def update_pickup_request_status(
    request_id: int,
    status_update: PickupRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        pickup_request = pickup_request_crud.change_pickup_request_status(
            db,
            request_id,
            status_update.new_status,
            current_user=current_user,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if pickup_request is None:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    return pickup_request


@router.delete("/{request_id}")
def delete_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        deleted = pickup_request_crud.delete_pickup_request(db, request_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    return {"message": "Pickup request deleted successfully"}
