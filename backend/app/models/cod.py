from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class COD(Base):
    __tablename__ = "cods"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, unique=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String, nullable=False, default="EGP")
    collected = Column(Boolean, default=False, nullable=False)
    collected_at = Column(DateTime, nullable=True)
    collected_by_driver_id = Column(Integer, nullable=True)
    transferred_to_customer = Column(Boolean, default=False, nullable=False)
    transferred_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    shipment = relationship("Shipment", back_populates="cod")
    payments = relationship("Payment", back_populates="cod")
