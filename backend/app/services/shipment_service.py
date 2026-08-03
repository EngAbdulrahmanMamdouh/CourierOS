from fastapi import HTTPException

from app.models.audit_log import AuditLog
from app.models.shipment_history import ShipmentHistory
from app.services.permissions import require_permission_by_name


def update_shipment_status(db, shipment, new_status, current_user):
    require_permission_by_name(current_user, "shipments.update")

    old_status = shipment.status

    valid_transitions = {
        "Pending": ["In Transit", "Cancelled"],
        "In Transit": ["Delivered", "Cancelled"],
        "Delivered": [],
        "Cancelled": []
    }

    if new_status.value not in valid_transitions.get(shipment.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {shipment.status} to {new_status.value}"
        )

    shipment.status = new_status.value

    history = ShipmentHistory(
        shipment_id=shipment.id,
        old_status=old_status,
        new_status=new_status.value,
        changed_by=current_user.id
    )

    db.add(history)

    audit_description = f"Status changed from {old_status} to {new_status.value}"
    from app.services.audit_service import log_event

    log_event(
        db=db,
        actor_id=current_user.id,
        action="status_changed",
        entity="shipment",
        entity_id=shipment.id,
        description=audit_description,
    )

    db.commit()
    db.refresh(shipment)

    return {
        "message": "Shipment status updated successfully",
        "shipment_id": shipment.id,
        "old_status": old_status,
        "new_status": new_status.value
    }