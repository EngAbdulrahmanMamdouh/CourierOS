from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    employee_code = Column(String, nullable=True)
    national_id = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=False)
    vehicle_plate = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    license_expiry = Column(DateTime, nullable=True)
    status = Column(String, default="Active", nullable=False)
    availability = Column(String, default="Available", nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    company = relationship("Company", back_populates="drivers")
    branch = relationship("Branch", back_populates="drivers")

    @property
    def branch_name(self):
        return self.branch.name if self.branch else None

    @property
    def assigned_shipments_count(self):
        return getattr(self, "_assigned_shipments_count", 0)

    @property
    def delivered_today_count(self):
        return getattr(self, "_delivered_today_count", 0)

    @property
    def pending_deliveries_count(self):
        return getattr(self, "_pending_deliveries_count", 0)
