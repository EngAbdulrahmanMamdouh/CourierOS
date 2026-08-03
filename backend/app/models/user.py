from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.shipment import Shipment
from app.models.customer import Customer
from app.models.branch import Branch


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False, index=True)

    email = Column(String, unique=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    role = Column(String, default="employee")

    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company = relationship("Company", back_populates="users")

    shipments = relationship("Shipment", foreign_keys="Shipment.owner_id", back_populates="owner")
    assigned_shipments = relationship("Shipment", foreign_keys="Shipment.assigned_to", back_populates="assigned_user")
    import_jobs = relationship("ImportJob", back_populates="uploader")