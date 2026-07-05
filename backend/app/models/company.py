from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    tax_number = Column(String, nullable=True)
    commercial_register = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    subscription_plan = Column(String, nullable=True)
    subscription_status = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    users = relationship("User", back_populates="company")
    customers = relationship("Customer", back_populates="company")
    branches = relationship("Branch", back_populates="company")
    drivers = relationship("Driver", back_populates="company")
    shipments = relationship("Shipment", back_populates="company")
