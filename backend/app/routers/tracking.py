from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.dependencies.auth import get_current_user

from app.services.tracking_service import get_public_tracking
from app.services.location_service import LocationService
from app.services.audit_service import create_audit_log
from app.schemas.tracking import TrackingResponse
from app.schemas.courier_location import (
    CourierLocationCreate,
    CourierLocationResponse,
    ActiveCourierResponse,
    CourierLocationHistoryResponse,
)
from app.models.user import User
from app.crud import courier_location as location_crud

router = APIRouter(prefix="/tracking", tags=["Tracking"])


# Public tracking endpoints (customer-facing)
@router.get("/track/{tracking_number}", response_model=TrackingResponse)
def public_track(tracking_number: str, db: Session = Depends(get_db)):
    """Get public tracking info for a shipment"""
    result = get_public_tracking(db, tracking_number)
    if result is None:
        raise HTTPException(status_code=404, detail="Tracking number not found")
    return result


# Courier location endpoints (authenticated)
@router.post("/location", response_model=CourierLocationResponse)
def save_location(
    location_data: CourierLocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save courier's current location"""
    if current_user.role not in ["employee", "driver"]:
        raise HTTPException(status_code=403, detail="Only couriers can report location")
    
    # Log the location submission
    try:
        location = location_crud.save_location(
            db=db,
            courier_id=current_user.id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            speed=location_data.speed,
            heading=location_data.heading,
            accuracy=location_data.accuracy,
            battery_level=location_data.battery_level,
            shipment_id=location_data.shipment_id,
        )
        
        # Create audit log
        create_audit_log(
            db=db,
            actor_id=current_user.id,
            action="LOCATION_SUBMITTED",
            entity="CourierLocation",
            entity_id=location.id,
            description=f"Location submitted: {location.latitude}, {location.longitude}",
            company_id=current_user.company_id,
        )
        
        return location
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save location: {str(e)}")


@router.get("/courier/{courier_id}", response_model=CourierLocationResponse)
def get_courier_location(
    courier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get latest location for a courier (company-isolated)"""
    if current_user.role not in ["admin", "company_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view courier locations")
    
    # Get courier to verify company isolation
    courier = db.query(User).filter(User.id == courier_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    
    # Company isolation: company_admin can only view own company couriers
    if current_user.role == "company_admin":
        if courier.company_id != current_user.company_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this courier")
    
    location = location_crud.get_latest_location(db, courier_id)
    if not location:
        raise HTTPException(status_code=404, detail="No location data found for courier")
    
    # Audit log for location view
    create_audit_log(
        db=db,
        actor_id=current_user.id,
        action="LOCATION_VIEWED",
        entity="CourierLocation",
        entity_id=location.id,
        description=f"Viewed location for courier {courier_id}",
        company_id=current_user.company_id,
    )
    
    return location


@router.get("/live", response_model=List[ActiveCourierResponse])
def get_live_couriers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all active couriers with latest location (company-isolated)"""
    if current_user.role not in ["admin", "company_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view courier locations")
    
    # Get active couriers
    couriers = location_crud.get_active_couriers(db, company_id=current_user.company_id if current_user.role == "company_admin" else None)
    
    # If company_admin, filter to own company only
    if current_user.role == "company_admin":
        filtered_couriers = []
        for courier_data in couriers:
            courier = db.query(User).filter(User.id == courier_data["courier_id"]).first()
            if courier and courier.company_id == current_user.company_id:
                filtered_couriers.append(courier_data)
        couriers = filtered_couriers
    
    # Audit log for live view
    create_audit_log(
        db=db,
        actor_id=current_user.id,
        action="LIVE_TRACKING_VIEWED",
        entity="CourierLocation",
        entity_id=0,
        description=f"Viewed live tracking for {len(couriers)} couriers",
        company_id=current_user.company_id,
    )
    
    return couriers


@router.get("/history/{courier_id}", response_model=List[CourierLocationHistoryResponse])
def get_courier_history(
    courier_id: int,
    hours: int = 24,
    limit: int = 500,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get location history for a courier (company-isolated)"""
    if current_user.role not in ["admin", "company_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view location history")
    
    # Validate hours and limit
    if hours <= 0 or hours > 720:  # Max 30 days
        raise HTTPException(status_code=400, detail="Hours must be between 1 and 720")
    if limit <= 0 or limit > 5000:  # Max 5000 records
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 5000")
    
    # Get courier to verify company isolation
    courier = db.query(User).filter(User.id == courier_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    
    # Company isolation: company_admin can only view own company couriers
    if current_user.role == "company_admin":
        if courier.company_id != current_user.company_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this courier's history")
    
    locations = location_crud.get_location_history(db, courier_id, hours=hours, limit=limit)
    
    # Audit log for history view
    create_audit_log(
        db=db,
        actor_id=current_user.id,
        action="LOCATION_HISTORY_VIEWED",
        entity="CourierLocation",
        entity_id=courier_id,
        description=f"Viewed {len(locations)} location records for courier {courier_id} ({hours} hours)",
        company_id=current_user.company_id,
    )
    
    return locations


@router.delete("/history/{courier_id}")
def clear_location_history(
    courier_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete old location records for a courier (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can clear location history")
    
    # Validate days parameter
    if days <= 0 or days > 365:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
    
    # Get courier to verify existence
    courier = db.query(User).filter(User.id == courier_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    
    deleted = location_crud.delete_old_locations(db, days=days)
    
    # Audit log for deletion
    create_audit_log(
        db=db,
        actor_id=current_user.id,
        action="LOCATION_HISTORY_DELETED",
        entity="CourierLocation",
        entity_id=courier_id,
        description=f"Deleted {deleted} location records older than {days} days",
        company_id=current_user.company_id,
    )
    
    return {
        "message": f"Deleted {deleted} old location records",
        "records_deleted": deleted,
    }

