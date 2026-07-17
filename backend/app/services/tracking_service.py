from sqlalchemy.orm import Session
from typing import Optional

from app.models.shipment import Shipment
from app.crud import shipment as shipment_crud


def _normalize_tracking_key(tracking_number: str) -> str:
    value = (tracking_number or '').strip()
    if not value:
        return value

    if value.startswith('TRK-'):
        return value

    if value.startswith('TRK') and value[3:].isdigit():
        return value

    return value


def _format_history_item(history):
    return {
        "old_status": history.old_status,
        "new_status": history.new_status,
        "changed_at": history.changed_at.isoformat() if history.changed_at else None,
    }


def get_public_tracking(db: Session, tracking_number: str) -> Optional[dict]:
    normalized = _normalize_tracking_key(tracking_number)

    shipment = None
    if normalized:
        shipment = db.query(Shipment).filter(Shipment.tracking_number == normalized, Shipment.is_deleted == False).first()

    if shipment is None and normalized:
        candidate_id = None
        if normalized.startswith('TRK-'):
            candidate_id = normalized[4:]
        elif normalized.startswith('TRK') and normalized[3:].isdigit():
            candidate_id = normalized[3:]

        if candidate_id and candidate_id.isdigit():
            shipment = db.query(Shipment).filter(Shipment.id == int(candidate_id), Shipment.is_deleted == False).first()

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

    created_date = timeline[0]["changed_at"] if len(timeline) > 0 else (shipment.created_at.isoformat() if getattr(shipment, 'created_at', None) else None)
    last_updated = timeline[-1]["changed_at"] if len(timeline) > 0 else None

    # delivered date if present in shipment or derived from timeline
    delivered_at = None
    if getattr(shipment, "delivered_at", None):
        delivered_at = shipment.delivered_at.isoformat()
    else:
        for item in reversed(timeline):
            if item.get("status") == "Delivered":
                delivered_at = item.get("changed_at")
                break

    company_name = None
    if getattr(shipment, "company", None) and getattr(shipment.company, "name", None):
        company_name = shipment.company.name

    return {
        "tracking_number": shipment.tracking_number,
        "status": shipment.status,
        "timeline": timeline,
        "created_date": created_date,
        "last_updated": last_updated,
        "created_at": shipment.created_at.isoformat() if getattr(shipment, 'created_at', None) else None,
        "delivered_at": delivered_at,
        "receiver_name": shipment.receiver_name,
        "cod_amount": float(shipment.cod_amount) if getattr(shipment, 'cod_amount', None) is not None else None,
        "destination_city": shipment.city,
        "estimated_delivery_date": getattr(shipment, "estimated_delivery_date", None),
        "company_name": company_name,
    }
