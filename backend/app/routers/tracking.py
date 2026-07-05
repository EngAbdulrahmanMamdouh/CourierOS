from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db

from app.services.tracking_service import get_public_tracking
from app.schemas.tracking import TrackingResponse

router = APIRouter()


@router.get("/track/{tracking_number}", response_model=TrackingResponse)
def public_track(tracking_number: str, db: Session = Depends(get_db)):
    result = get_public_tracking(db, tracking_number)
    if result is None:
        raise HTTPException(status_code=404, detail="Tracking number not found")
    return result
