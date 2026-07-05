from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    shipments = relationship("Shipment", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    pickup_requests = relationship("PickupRequest", back_populates="customer")
    company = relationship("Company", back_populates="customers")
    payments = relationship("Payment", back_populates="customer")
    pickup_requests = relationship("PickupRequest", back_populates="customer")
