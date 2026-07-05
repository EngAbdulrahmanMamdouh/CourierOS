from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import city as city_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.city import CityCreate, CityResponse, CityUpdate

router = APIRouter(
    prefix="/cities",
    tags=["Cities"],
)


@router.get("/", response_model=list[CityResponse])
def get_cities(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return city_crud.get_all_cities(db=db, page=page, size=size, current_user=current_user, search=search)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.get("/{city_id}", response_model=CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        city = city_crud.get_city_by_id(db, city_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if city is None:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/", response_model=CityResponse)
def create_city(city: CityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return city_crud.create_city(db, city, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.put("/{city_id}", response_model=CityResponse)
def update_city(city_id: int, city: CityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = city_crud.update_city(db, city_id, city, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="City not found")
    return updated


@router.delete("/{city_id}")
def delete_city(city_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        deleted = city_crud.delete_city(db, city_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="City not found")

    return {"message": "City deleted successfully"}
