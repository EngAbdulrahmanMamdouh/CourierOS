from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.crud import finance as finance_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.finance import (
    CodCollectionResponse,
    CourierSettlementResponse,
    CustomerLedgerResponse,
    FinanceSummaryResponse,
)

router = APIRouter(
    prefix="/finance",
    tags=["Finance"],
)


class CodCollectionRequest(BaseModel):
    amount_due: float
    cash_tendered: float
    change_due: float
    transaction_reference: str | None = None
    notes: str | None = None


@router.post("/shipments/{shipment_id}/collect", response_model=CodCollectionResponse)
def collect_cod(
    shipment_id: int,
    payload: CodCollectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return finance_crud.collect_cod(db, shipment_id, payload.__dict__, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/summary", response_model=FinanceSummaryResponse)
def finance_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return finance_crud.get_finance_summary(db, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.get("/customers/{customer_id}/ledger", response_model=CustomerLedgerResponse)
def customer_ledger(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return finance_crud.get_customer_ledger(db, customer_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/drivers/{driver_id}/settlement", response_model=CourierSettlementResponse)
def courier_settlement(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return finance_crud.get_courier_settlement(db, driver_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/history")
def finance_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return finance_crud.get_finance_history(db, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.get("/reports")
def finance_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return finance_crud.get_finance_reports(db, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
