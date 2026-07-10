from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class CourierLocation(Base):
    __tablename__ = "courier_locations"

    id = Column(Integer, primary_key=True, index=True)
    
    courier_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True, index=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=True, default=0.0)
    heading = Column(Float, nullable=True, default=0.0)
    accuracy = Column(Float, nullable=True)
    battery_level = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    courier = relationship("User", foreign_keys=[courier_id])
    shipment = relationship("Shipment", foreign_keys=[shipment_id])
