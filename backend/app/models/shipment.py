from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    sender_name = Column(String, nullable=False)
    receiver_name = Column(String, nullable=False)
    receiver_phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    status = Column(String, default="Pending")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    tracking_number = Column(String, unique=True, nullable=True, index=True)
    estimated_delivery_days = Column(Integer, nullable=False, default=1)
    notes = Column(String, nullable=True, default="")
    cod_amount = Column(Float, nullable=True, default=0.0)
    shipping_price = Column(Float, nullable=True, default=None)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    owner = relationship("User", foreign_keys=[owner_id], back_populates="shipments")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_shipments")
    customer = relationship("Customer", back_populates="shipments")
    company = relationship("Company", back_populates="shipments")
    cod = relationship("COD", back_populates="shipment", uselist=False)
    payments = relationship("Payment", back_populates="shipment")

