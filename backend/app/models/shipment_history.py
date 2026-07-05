from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database import Base


class ShipmentHistory(Base):
    __tablename__ = "shipment_history"

    id = Column(Integer, primary_key=True, index=True)

    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)

    old_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)

    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))