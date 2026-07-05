from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.pickup_request import PickupRequest
from app.models.pickup_request_status import PickupRequestStatus
from app.services.audit_service import create_audit_log


def change_pickup_request_status(db: Session, pickup_request: PickupRequest, new_status: PickupRequestStatus, current_user):
    old_status = pickup_request.status

    valid_transitions = {
        PickupRequestStatus.pending.value: [PickupRequestStatus.approved.value, PickupRequestStatus.cancelled.value],
        PickupRequestStatus.approved.value: [PickupRequestStatus.assigned.value, PickupRequestStatus.cancelled.value],
        PickupRequestStatus.assigned.value: [PickupRequestStatus.picked_up.value, PickupRequestStatus.cancelled.value],
        PickupRequestStatus.picked_up.value: [PickupRequestStatus.converted_to_shipment.value, PickupRequestStatus.cancelled.value],
        PickupRequestStatus.converted_to_shipment.value: [],
        PickupRequestStatus.cancelled.value: [],
    }

    if new_status.value not in valid_transitions.get(pickup_request.status, []):
        raise ValueError(f"Invalid transition from {pickup_request.status} to {new_status.value}")

    if new_status == PickupRequestStatus.assigned and pickup_request.status != PickupRequestStatus.approved.value:
        raise ValueError("Only approved requests may be assigned")

    if new_status == PickupRequestStatus.picked_up and pickup_request.status != PickupRequestStatus.assigned.value:
        raise ValueError("Only assigned requests may be picked up")

    pickup_request.status = new_status.value
    pickup_request.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(pickup_request)

    create_audit_log(
        db=db,
        actor_id=current_user.id,
        action="status_changed",
        entity="pickup_request",
        entity_id=pickup_request.id,
        description=f"Changed status from {old_status} to {new_status.value}",
    )

    return pickup_request
