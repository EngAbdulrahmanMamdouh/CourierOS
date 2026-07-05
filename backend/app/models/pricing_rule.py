from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id = Column(Integer, primary_key=True, index=True)
    source_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    destination_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    delivery_zone_id = Column(Integer, ForeignKey("delivery_zones.id"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    service_type = Column(String, nullable=False)
    min_weight = Column(Numeric(10, 2), nullable=False, default=0)
    max_weight = Column(Numeric(10, 2), nullable=False, default=0)
    base_price = Column(Numeric(10, 2), nullable=False, default=0)
    extra_cost = Column(Numeric(10, 2), nullable=False, default=0)
    estimated_delivery_days = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    source_city = relationship("City", foreign_keys=[source_city_id])
    destination_city = relationship("City", foreign_keys=[destination_city_id])
    delivery_zone = relationship("DeliveryZone")
