from sqlalchemy.orm import Session
from typing import Optional

from app.models.shipment import Shipment
from app.crud import shipment as shipment_crud


def _format_history_item(history):
    return {
        "old_status": history.old_status,
        "new_status": history.new_status,
        "changed_at": history.changed_at.isoformat() if history.changed_at else None,
    }


def get_public_tracking(db: Session, tracking_number: str) -> Optional[dict]:
    # find shipment by tracking number and ensure not deleted
    shipment = db.query(Shipment).filter(Shipment.tracking_number == tracking_number, Shipment.is_deleted == False).first()
    if shipment is None:
        return None

    # build timeline from shipment history
    history_items = shipment_crud.get_shipment_history(db, shipment.id, current_user=None)
    # sort chronologically by changed_at
    history_items = sorted(history_items, key=lambda h: h.changed_at or 0)

    timeline = [
        {
            "status": h.new_status,
            "changed_at": h.changed_at.isoformat() if h.changed_at else None,
        }
        for h in history_items
    ]

    created_date = timeline[0]["changed_at"] if len(timeline) > 0 else None
    last_updated = timeline[-1]["changed_at"] if len(timeline) > 0 else None

    company_name = None
    if getattr(shipment, "company", None) and getattr(shipment.company, "name", None):
        company_name = shipment.company.name

    return {
        "tracking_number": shipment.tracking_number,
        "status": shipment.status,
        "timeline": timeline,
        "created_date": created_date,
        "last_updated": last_updated,
        "destination_city": shipment.city,
        "estimated_delivery_date": getattr(shipment, "estimated_delivery_date", None),
        "company_name": company_name,
    }
