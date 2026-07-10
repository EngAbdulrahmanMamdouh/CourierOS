from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from app.crud import courier_location as location_crud
from app.models.user import User


class LocationService:
    """Service for managing courier locations"""

    @staticmethod
    def record_location(
        db: Session,
        courier_id: int,
        latitude: float,
        longitude: float,
        speed: float = 0.0,
        heading: float = 0.0,
        accuracy: Optional[float] = None,
        battery_level: Optional[float] = None,
        shipment_id: Optional[int] = None,
    ) -> dict:
        """Record courier location"""
        location = location_crud.save_location(
            db=db,
            courier_id=courier_id,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            heading=heading,
            accuracy=accuracy,
            battery_level=battery_level,
            shipment_id=shipment_id,
        )
        
        return {
            "id": location.id,
            "courier_id": location.courier_id,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "created_at": location.created_at.isoformat(),
        }

    @staticmethod
    def get_courier_location(db: Session, courier_id: int) -> Optional[dict]:
        """Get latest location for courier"""
        location = location_crud.get_latest_location(db, courier_id)
        if not location:
            return None
        
        return {
            "id": location.id,
            "courier_id": location.courier_id,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "speed": location.speed,
            "heading": location.heading,
            "accuracy": location.accuracy,
            "battery_level": location.battery_level,
            "shipment_id": location.shipment_id,
            "created_at": location.created_at.isoformat(),
        }

    @staticmethod
    def get_active_couriers(db: Session) -> List[dict]:
        """Get all active couriers (with location update in last 2 minutes)"""
        return location_crud.get_active_couriers(db)

    @staticmethod
    def get_courier_route(db: Session, courier_id: int, hours: int = 24) -> List[dict]:
        """Get route history for courier"""
        locations = location_crud.get_location_history(db, courier_id, hours=hours)
        
        return [
            {
                "id": loc.id,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "speed": loc.speed,
                "heading": loc.heading,
                "accuracy": loc.accuracy,
                "battery_level": loc.battery_level,
                "created_at": loc.created_at.isoformat(),
                "shipment_id": loc.shipment_id,
            }
            for loc in locations
        ]

    @staticmethod
    def cleanup_old_locations(db: Session, days: int = 7) -> int:
        """Clean up old location records"""
        return location_crud.delete_old_locations(db, days=days)
