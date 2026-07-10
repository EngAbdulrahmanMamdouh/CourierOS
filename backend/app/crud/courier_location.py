from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from app.models.courier_location import CourierLocation
from app.models.user import User
from app.models.shipment import Shipment


def save_location(
    db: Session,
    courier_id: int,
    latitude: float,
    longitude: float,
    speed: float = 0.0,
    heading: float = 0.0,
    accuracy: Optional[float] = None,
    battery_level: Optional[float] = None,
    shipment_id: Optional[int] = None,
) -> CourierLocation:
    """Save courier location"""
    location = CourierLocation(
        courier_id=courier_id,
        latitude=latitude,
        longitude=longitude,
        speed=speed,
        heading=heading,
        accuracy=accuracy,
        battery_level=battery_level,
        shipment_id=shipment_id,
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def get_latest_location(db: Session, courier_id: int) -> Optional[CourierLocation]:
    """Get latest location for a courier"""
    return db.query(CourierLocation).filter(
        CourierLocation.courier_id == courier_id
    ).order_by(desc(CourierLocation.created_at)).first()


def get_active_couriers(db: Session, company_id: Optional[int] = None) -> List[dict]:
    """Get all active couriers with latest location (updated in last 2 minutes)"""
    two_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=2)
    
    query = db.query(CourierLocation).filter(
        CourierLocation.created_at >= two_minutes_ago
    ).order_by(desc(CourierLocation.created_at))
    
    locations = query.all()
    
    # Deduplicate by courier_id (keep latest)
    seen_couriers = set()
    active_couriers = []
    
    for location in locations:
        if location.courier_id not in seen_couriers:
            seen_couriers.add(location.courier_id)
            courier = db.query(User).filter(User.id == location.courier_id).first()
            
            # Apply company filter if provided
            if company_id is not None and courier and courier.company_id != company_id:
                continue
            
            shipment_receiver = None
            shipment_status = None
            if location.shipment_id:
                shipment = db.query(Shipment).filter(Shipment.id == location.shipment_id).first()
                if shipment:
                    shipment_receiver = shipment.receiver_name
                    shipment_status = shipment.status
            
            active_couriers.append({
                "courier_id": location.courier_id,
                "courier_name": courier.username if courier else "Unknown",
                "latitude": location.latitude,
                "longitude": location.longitude,
                "speed": location.speed,
                "heading": location.heading,
                "battery_level": location.battery_level,
                "shipment_id": location.shipment_id,
                "shipment_receiver": shipment_receiver,
                "shipment_status": shipment_status,
                "last_update": location.created_at.isoformat(),
                "accuracy": location.accuracy,
            })
    
    return active_couriers


def get_location_history(
    db: Session,
    courier_id: int,
    hours: int = 24,
    limit: int = 500,
) -> List[CourierLocation]:
    """Get location history for a courier"""
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    return db.query(CourierLocation).filter(
        CourierLocation.courier_id == courier_id,
        CourierLocation.created_at >= cutoff_time,
    ).order_by(desc(CourierLocation.created_at)).limit(limit).all()


def delete_old_locations(db: Session, days: int = 7) -> int:
    """Delete location records older than specified days"""
    cutoff_time = datetime.now(timezone.utc) - timedelta(days=days)
    
    deleted = db.query(CourierLocation).filter(
        CourierLocation.created_at < cutoff_time
    ).delete()
    
    db.commit()
    return deleted
