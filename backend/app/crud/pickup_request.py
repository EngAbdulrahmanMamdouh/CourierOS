from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.pickup_request import PickupRequest
from app.schemas.pickup_request import PickupRequestCreate, PickupRequestUpdate
from app.services.audit_service import create_audit_log
from app.services.permissions import require_permission
from app.models.pickup_request_status import PickupRequestStatus
from app.services.pickup_request_service import change_pickup_request_status as change_status_service
from app.services.tenant_context import is_platform_admin, require_company_context
from app.models.customer import Customer


def _ensure_access(current_user, action: str):
    if current_user is None:
        raise PermissionError("Not authorized")

    if current_user.role == "admin":
        return

    if current_user.role == "employee":
        return

    if current_user.role == "user" and action in {"view", "create"}:
        return

    raise PermissionError("Not authorized")


def get_all_pickup_requests(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None, include_deleted: bool = False):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(PickupRequest)

    if not include_deleted:
        query = query.filter(PickupRequest.is_deleted == False)

    if current_user is not None and current_user.role == "user":
        query = query.filter(PickupRequest.created_by == current_user.id)

    if search:
        search_value = f"%{search}%"
        query = query.filter(
            (PickupRequest.pickup_address.ilike(search_value)) |
            (PickupRequest.contact_name.ilike(search_value)) |
            (PickupRequest.contact_phone.ilike(search_value))
        )

    return query.order_by(PickupRequest.id.desc()).offset(offset).limit(size).all()


def get_pickup_request_by_id(db: Session, request_id: int, current_user=None, include_deleted: bool = False):
    _ensure_access(current_user, "view")

    query = db.query(PickupRequest).filter(PickupRequest.id == request_id)
    if not include_deleted:
        query = query.filter(PickupRequest.is_deleted == False)

    if current_user is not None and current_user.role == "user":
        query = query.filter(PickupRequest.created_by == current_user.id)

    return query.first()


def create_pickup_request(db: Session, request_data: PickupRequestCreate, current_user=None):
    _ensure_access(current_user, "create")

    # Validate customer belongs to current tenant for non-platform admins
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        customer = db.query(Customer).filter(Customer.id == request_data.customer_id, Customer.company_id == company_id).first()
        if customer is None:
            raise PermissionError("Customer does not belong to your company")

    pickup_request = PickupRequest(
        customer_id=request_data.customer_id,
        pickup_address=request_data.pickup_address,
        city_id=request_data.city_id,
        contact_name=request_data.contact_name,
        contact_phone=request_data.contact_phone,
        preferred_pickup_date=request_data.preferred_pickup_date,
        preferred_time_window=request_data.preferred_time_window,
        notes=request_data.notes,
        status=PickupRequestStatus.pending.value,
        assigned_branch_id=request_data.assigned_branch_id,
        assigned_driver_id=request_data.assigned_driver_id,
        created_by=current_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db.add(pickup_request)
    db.commit()
    db.refresh(pickup_request)

    create_audit_log(
        db,
        actor_id=current_user.id,
        action="create",
        entity="pickup_request",
        entity_id=pickup_request.id,
        description=f"Created pickup request {pickup_request.id}",
    )

    return pickup_request


def update_pickup_request(db: Session, request_id: int, request_data: PickupRequestUpdate, current_user=None):
    _ensure_access(current_user, "update")
    pickup_request = get_pickup_request_by_id(db, request_id, current_user=current_user)
    if pickup_request is None:
        return None

    if current_user.role == "user" and pickup_request.created_by != current_user.id:
        raise PermissionError("Not authorized")

    # Ensure updated customer belongs to tenant
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        customer = db.query(Customer).filter(Customer.id == request_data.customer_id, Customer.company_id == company_id).first()
        if customer is None:
            raise PermissionError("Customer does not belong to your company")

    pickup_request.customer_id = request_data.customer_id
    pickup_request.pickup_address = request_data.pickup_address
    pickup_request.city_id = request_data.city_id
    pickup_request.contact_name = request_data.contact_name
    pickup_request.contact_phone = request_data.contact_phone
    pickup_request.preferred_pickup_date = request_data.preferred_pickup_date
    pickup_request.preferred_time_window = request_data.preferred_time_window
    pickup_request.notes = request_data.notes
    pickup_request.assigned_branch_id = request_data.assigned_branch_id
    pickup_request.assigned_driver_id = request_data.assigned_driver_id
    pickup_request.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(pickup_request)

    create_audit_log(
        db,
        actor_id=current_user.id,
        action="update",
        entity="pickup_request",
        entity_id=pickup_request.id,
        description=f"Updated pickup request {pickup_request.id}",
    )

    return pickup_request


def delete_pickup_request(db: Session, request_id: int, current_user=None):
    _ensure_access(current_user, "update")
    pickup_request = get_pickup_request_by_id(db, request_id, current_user=current_user)
    if pickup_request is None:
        return None

    pickup_request.is_deleted = True
    pickup_request.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(pickup_request)

    create_audit_log(
        db,
        actor_id=current_user.id,
        action="delete",
        entity="pickup_request",
        entity_id=pickup_request.id,
        description=f"Deleted pickup request {pickup_request.id}",
    )

    return pickup_request


def change_pickup_request_status(db: Session, request_id: int, new_status: str, current_user=None):
    _ensure_access(current_user, "update")

    pickup_request = get_pickup_request_by_id(db, request_id, current_user=current_user)
    if pickup_request is None:
        return None

    return change_status_service(db, pickup_request, PickupRequestStatus(new_status), current_user)
