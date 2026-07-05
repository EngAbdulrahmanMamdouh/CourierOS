from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import delivery_zone as zone_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.delivery_zone import DeliveryZoneCreate, DeliveryZoneResponse, DeliveryZoneUpdate

router = APIRouter(
    prefix="/delivery-zones",
    tags=["Delivery Zones"],
)


@router.get("/", response_model=list[DeliveryZoneResponse])
def get_delivery_zones(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return zone_crud.get_all_delivery_zones(db=db, page=page, size=size, current_user=current_user, search=search)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.get("/{zone_id}", response_model=DeliveryZoneResponse)
def get_delivery_zone(zone_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        zone = zone_crud.get_delivery_zone_by_id(db, zone_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if zone is None:
        raise HTTPException(status_code=404, detail="Delivery zone not found")
    return zone


@router.post("/", response_model=DeliveryZoneResponse)
def create_delivery_zone(zone: DeliveryZoneCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return zone_crud.create_delivery_zone(db, zone, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.put("/{zone_id}", response_model=DeliveryZoneResponse)
def update_delivery_zone(zone_id: int, zone: DeliveryZoneUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = zone_crud.update_delivery_zone(db, zone_id, zone, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="Delivery zone not found")
    return updated


@router.delete("/{zone_id}")
def delete_delivery_zone(zone_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        deleted = zone_crud.delete_delivery_zone(db, zone_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="Delivery zone not found")

    return {"message": "Delivery zone deleted successfully"}
