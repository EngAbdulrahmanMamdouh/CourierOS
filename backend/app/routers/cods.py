from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import cod as cod_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.cod import CODCreate, CODResponse, CODUpdate

router = APIRouter(
    prefix="/cods",
    tags=["COD"],
)


@router.get("/", response_model=list[CODResponse])
def get_cods(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return cod_crud.get_all_cods(db=db, page=page, size=size, current_user=current_user, search=search)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.get("/{cod_id}", response_model=CODResponse)
def get_cod(cod_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        cod = cod_crud.get_cod_by_id(db, cod_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if cod is None:
        raise HTTPException(status_code=404, detail="COD not found")
    return cod


@router.post("/", response_model=CODResponse)
def create_cod(cod: CODCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return cod_crud.create_cod(db, cod, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{cod_id}", response_model=CODResponse)
def update_cod(cod_id: int, cod: CODUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = cod_crud.update_cod(db, cod_id, cod, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="COD not found")
    return updated


@router.delete("/{cod_id}")
def delete_cod(cod_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        deleted = cod_crud.delete_cod(db, cod_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="COD not found")

    return {"message": "COD deleted successfully"}
