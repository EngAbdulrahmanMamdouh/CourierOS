from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    pickup_address = Column(String, nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    contact_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    preferred_pickup_date = Column(DateTime, nullable=False)
    preferred_time_window = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(String, default="Pending", nullable=False)
    assigned_branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True, index=True)
    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    customer = relationship("Customer", back_populates="pickup_requests")
    city = relationship("City")
    assigned_branch = relationship("Branch")
    assigned_driver = relationship("Driver")
    creator = relationship("User")
