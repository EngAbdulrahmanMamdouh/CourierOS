from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import pricing_rule as pricing_rule_crud
from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.pricing_rule import PricingRuleCreate, PricingRuleResponse, PricingRuleUpdate

router = APIRouter(
    prefix="/pricing-rules",
    tags=["Pricing Rules"],
)


@router.get("/", response_model=list[PricingRuleResponse])
def get_pricing_rules(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return pricing_rule_crud.get_all_pricing_rules(db=db, page=page, size=size, current_user=current_user, search=search)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc


@router.get("/{pricing_rule_id}", response_model=PricingRuleResponse)
def get_pricing_rule(pricing_rule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        pricing_rule = pricing_rule_crud.get_pricing_rule_by_id(db, pricing_rule_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if pricing_rule is None:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    return pricing_rule


@router.post("/", response_model=PricingRuleResponse)
def create_pricing_rule(pricing_rule: PricingRuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return pricing_rule_crud.create_pricing_rule(db, pricing_rule, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{pricing_rule_id}", response_model=PricingRuleResponse)
def update_pricing_rule(pricing_rule_id: int, pricing_rule: PricingRuleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = pricing_rule_crud.update_pricing_rule(db, pricing_rule_id, pricing_rule, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    return updated


@router.delete("/{pricing_rule_id}")
def delete_pricing_rule(pricing_rule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        deleted = pricing_rule_crud.delete_pricing_rule(db, pricing_rule_id, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized") from exc

    if deleted is None:
        raise HTTPException(status_code=404, detail="Pricing rule not found")

    return {"message": "Pricing rule deleted successfully"}
