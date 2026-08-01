from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.city import City
from app.models.customer import Customer
from app.models.delivery_zone import DeliveryZone
from app.models.pricing_rule import PricingRule
from app.models.shipment import Shipment
from app.models.shipment_history import ShipmentHistory


def _apply_visibility_filter(query, current_user=None, include_deleted=False):
    if not include_deleted:
        query = query.filter(Shipment.is_deleted == False)

    if current_user is None:
        return query

    # Admin users see all shipments (unrestricted)
    if current_user.role == "admin":
        return query

    # If current_user has no company context, preserve legacy access by skipping company filter
    if current_user.company_id is not None:
        query = query.filter(Shipment.company_id == current_user.company_id)

        # company_admin and user roles see all shipments in their company
        if current_user.role in ("company_admin", "user"):
            return query

    # employee role: only see shipments they own or are assigned to
    if current_user.role == "employee":
        return query.filter(
            (Shipment.owner_id == current_user.id) | (Shipment.assigned_to == current_user.id)
        )

    return query


def get_all_shipments(
    db: Session,
    page: int = 1,
    size: int = 10,
    current_user=None,
    include_deleted: bool = False,
    search: str = None,
    status: str = None,
    city: str = None,
):
    offset = (page - 1) * size

    query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Shipment.receiver_name.ilike(search_term),
                Shipment.sender_name.ilike(search_term),
                Shipment.city.ilike(search_term),
                Shipment.tracking_number.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Shipment.status == status)

    if city:
        query = query.filter(Shipment.city.ilike(f"%{city}%"))

    return query.order_by(Shipment.created_at.desc()).offset(offset).limit(size).all()


def get_shipment_by_id(db: Session, shipment_id: int, current_user=None, include_deleted: bool = False):
    query = _apply_visibility_filter(db.query(Shipment).filter(Shipment.id == shipment_id), current_user, include_deleted=include_deleted)

    return query.first()


def assign_shipment(db: Session, shipment_id: int, employee_id: int, current_user=None):
    if current_user is None or current_user.role != "admin":
        raise PermissionError("Only admins can assign shipments")

    shipment = _apply_visibility_filter(db.query(Shipment).filter(Shipment.id == shipment_id), current_user).first()
    if shipment is None:
        return None

    shipment.assigned_to = employee_id
    db.commit()
    db.refresh(shipment)
    return shipment


def _validate_related_entities(db: Session, shipment_data, company_id: int):
    """Validate that related entities belong to the same company"""
    if hasattr(shipment_data, 'customer_id') and shipment_data.customer_id:
        customer = db.query(Customer).filter(
            Customer.id == shipment_data.customer_id,
            Customer.company_id == company_id
        ).first()
        if customer is None:
            raise ValueError(f"Customer {shipment_data.customer_id} does not belong to this company")


def _ensure_customer_for_shipment(db: Session, shipment_data, company_id: int):
    if company_id is None:
        company_id = 1

    receiver_phone = getattr(shipment_data, "receiver_phone", None)
    receiver_name = getattr(shipment_data, "receiver_name", None)

    if hasattr(shipment_data, "customer_id") and getattr(shipment_data, "customer_id", None):
        customer = db.query(Customer).filter(Customer.id == shipment_data.customer_id, Customer.company_id == company_id).first()
        if customer is None:
            raise ValueError(f"Customer {shipment_data.customer_id} does not belong to this company")
        return customer.id

    if receiver_phone:
        customer = db.query(Customer).filter(
            Customer.phone == str(receiver_phone),
            Customer.company_id == company_id,
        ).first()
        if customer is not None:
            return customer.id

    if receiver_name:
        customer = db.query(Customer).filter(
            Customer.full_name.ilike(str(receiver_name)),
            Customer.company_id == company_id,
        ).first()
        if customer is not None:
            return customer.id

    customer = Customer(
        full_name=str(receiver_name or "Unknown Customer"),
        phone=str(receiver_phone or "00000000000"),
        email=None,
        company_name=None,
        address=getattr(shipment_data, "address", "") or "",
        city=getattr(shipment_data, "city", "") or "",
        notes=getattr(shipment_data, "notes", None),
        company_id=company_id,
        is_active=True,
    )
    db.add(customer)
    db.flush()
    return customer.id


def _resolve_pricing_rule(db: Session, shipment_data, company_id: int | None = None):
    if company_id is None:
        return None

    origin_city_name = (
        getattr(shipment_data, "origin_city", None)
        or getattr(shipment_data, "origin_city_name", None)
        or getattr(shipment_data, "sender_city", None)
        or getattr(shipment_data, "source_city", None)
        or getattr(shipment_data, "city", None)
    )
    destination_city_name = (
        getattr(shipment_data, "destination_city", None)
        or getattr(shipment_data, "destination_city_name", None)
        or getattr(shipment_data, "city", None)
    )

    if not origin_city_name or not destination_city_name:
        return None

    try:
        origin_city = (
            db.query(City)
            .filter(City.name.ilike(str(origin_city_name)), City.company_id == company_id)
            .first()
        )
        destination_city = (
            db.query(City)
            .filter(City.name.ilike(str(destination_city_name)), City.company_id == company_id)
            .first()
        )
    except Exception:
        return None

    if origin_city is None or destination_city is None:
        return None

    delivery_zone_id = None
    zone_value = getattr(shipment_data, "delivery_zone", None) or getattr(shipment_data, "delivery_zone_id", None)
    if zone_value is not None:
        try:
            if isinstance(zone_value, int):
                delivery_zone = (
                    db.query(DeliveryZone)
                    .filter(DeliveryZone.id == zone_value, DeliveryZone.company_id == company_id)
                    .first()
                )
            else:
                delivery_zone = (
                    db.query(DeliveryZone)
                    .filter(DeliveryZone.zone_name.ilike(str(zone_value)), DeliveryZone.company_id == company_id)
                    .first()
                )
            if delivery_zone is not None:
                delivery_zone_id = delivery_zone.id
        except Exception:
            delivery_zone_id = None

    try:
        query = (
            db.query(PricingRule)
            .filter(
                PricingRule.company_id == company_id,
                PricingRule.source_city_id == origin_city.id,
                PricingRule.destination_city_id == destination_city.id,
                PricingRule.is_deleted == False,
                PricingRule.is_active == True,
            )
        )
        if delivery_zone_id is not None:
            query = query.filter(PricingRule.delivery_zone_id == delivery_zone_id)
        else:
            query = query.filter(PricingRule.delivery_zone_id.is_(None))

        return query.order_by(PricingRule.id.desc()).first()
    except Exception:
        return None


def _calculate_shipping_price(db: Session, shipment_data, company_id: int | None = None):
    pricing_rule = _resolve_pricing_rule(db, shipment_data, company_id)
    if pricing_rule is None:
        return None

    try:
        base_price = float(pricing_rule.base_price or 0)
    except Exception:
        base_price = 0.0

    extra_weight_fee = 0.0
    try:
        weight = getattr(shipment_data, "weight", None)
        if weight is not None:
            weight_value = float(weight)
            max_weight = float(pricing_rule.max_weight or 0)
            if weight_value > max_weight:
                extra_weight_fee = float(pricing_rule.extra_cost or 0)
    except Exception:
        extra_weight_fee = 0.0

    cod_fee = 0.0
    try:
        cod_fee_value = getattr(shipment_data, "cod_fee", None)
        if cod_fee_value is not None:
            cod_fee = float(cod_fee_value)
    except Exception:
        cod_fee = 0.0

    return base_price + extra_weight_fee + cod_fee


def _build_shipment_from_data(shipment_data, owner_id: int = None, company_id: int = None):
    if owner_id is None:
        owner_id = 1
    if company_id is None:
        company_id = 1

    status = getattr(shipment_data, "status", None) or "Pending"
    estimated_delivery_days = getattr(shipment_data, "estimated_delivery_days", None) or 1
    notes = getattr(shipment_data, "notes", None) or ""
    cod_amount = getattr(shipment_data, "cod_amount", None) or 0.0
    shipping_price = getattr(shipment_data, "shipping_price", None)

    return Shipment(
        sender_name=shipment_data.sender_name,
        receiver_name=shipment_data.receiver_name,
        receiver_phone=shipment_data.receiver_phone,
        address=shipment_data.address,
        city=shipment_data.city,
        status=status,
        owner_id=owner_id,
        company_id=company_id,
        estimated_delivery_days=estimated_delivery_days,
        notes=notes,
        cod_amount=cod_amount,
        shipping_price=shipping_price,
    )


def create_shipment(db: Session, shipment_data, owner_id: int = None, company_id: int = None, current_user=None):
    if owner_id is None:
        owner_id = 1
    if company_id is None:
        company_id = current_user.company_id if current_user else 1

    _validate_related_entities(db, shipment_data, company_id)
    customer_id = _ensure_customer_for_shipment(db, shipment_data, company_id)
    shipment = _build_shipment_from_data(shipment_data, owner_id, company_id)
    shipment.customer_id = customer_id
    shipment.shipping_price = _calculate_shipping_price(db, shipment_data, company_id)

    db.add(shipment)
    db.commit()
    db.refresh(shipment)

    # assign a globally unique tracking number and create initial history
    shipment.tracking_number = f"TRK{shipment.id:010d}"
    db.add(shipment)
    history = ShipmentHistory(
        shipment_id=shipment.id,
        old_status="",
        new_status=shipment.status,
        changed_by=owner_id
    )
    db.add(history)
    db.commit()
    db.refresh(shipment)

    return shipment


def bulk_create_shipments(db: Session, shipment_datas: list, owner_id: int = None, company_id: int = None):
    if owner_id is None:
        owner_id = 1
    if company_id is None:
        company_id = 1

    shipments = []
    for shipment_data in shipment_datas:
        customer_id = _ensure_customer_for_shipment(db, shipment_data, company_id)
        shipment = _build_shipment_from_data(shipment_data, owner_id, company_id)
        shipment.customer_id = customer_id
        shipment.shipping_price = _calculate_shipping_price(db, shipment_data, company_id)
        shipments.append(shipment)

    db.add_all(shipments)
    db.commit()
    return shipments


def update_shipment(db: Session, shipment_id: int, shipment_data, current_user=None, include_deleted: bool = False):
    query = _apply_visibility_filter(db.query(Shipment).filter(Shipment.id == shipment_id), current_user, include_deleted=include_deleted)

    shipment = query.first()

    if shipment is None:
        return None

    shipment.sender_name = shipment_data.sender_name
    shipment.receiver_name = shipment_data.receiver_name
    shipment.receiver_phone = shipment_data.receiver_phone
    shipment.address = shipment_data.address
    shipment.city = shipment_data.city
    shipment.status = getattr(shipment_data, "status", shipment.status) or shipment.status
    shipment.estimated_delivery_days = getattr(shipment_data, "estimated_delivery_days", shipment.estimated_delivery_days) or shipment.estimated_delivery_days
    shipment.notes = getattr(shipment_data, "notes", None) or ""
    shipment.cod_amount = getattr(shipment_data, "cod_amount", shipment.cod_amount)
    shipment.shipping_price = getattr(shipment_data, "shipping_price", shipment.shipping_price)

    db.commit()
    db.refresh(shipment)

    return shipment


def delete_shipment(db: Session, shipment_id: int, current_user=None, include_deleted: bool = False):
    query = _apply_visibility_filter(db.query(Shipment).filter(Shipment.id == shipment_id), current_user, include_deleted=include_deleted)

    shipment = query.first()

    if shipment is None:
        return None

    shipment.is_deleted = True
    shipment.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(shipment)

    return shipment


def get_shipment_history(db: Session, shipment_id: int, current_user=None):
    shipment = get_shipment_by_id(db, shipment_id, current_user=current_user)
    if shipment is None:
        return []
    
    return db.query(ShipmentHistory).filter(
        ShipmentHistory.shipment_id == shipment_id
    ).all()


def search_shipments(
    db: Session,
    city: str = None,
    status: str = None,
    receiver_name: str = None,
    current_user=None,
    include_deleted: bool = False,
):
    query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    if city:
        query = query.filter(
            Shipment.city.ilike(f"%{city}%")
        )

    if status:
        query = query.filter(
            Shipment.status == status
        )

    if receiver_name:
        query = query.filter(
            Shipment.receiver_name.ilike(f"%{receiver_name}%")
        )

    return query.all()



def get_accessible_shipments(db: Session, current_user=None, include_deleted: bool = False):
    query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    return query.all()


def get_dashboard_statistics(db: Session, current_user=None, include_deleted: bool = False):
    query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    total_shipments = query.count()

    pending = query.filter(
        Shipment.status == "Pending"
    ).count()

    in_transit = query.filter(
        Shipment.status == "In Transit"
    ).count()

    delivered = query.filter(
        Shipment.status == "Delivered"
    ).count()

    cancelled = query.filter(
        Shipment.status == "Cancelled"
    ).count()

    return {
        "total_shipments": total_shipments,
        "pending": pending,
        "in_transit": in_transit,
        "delivered": delivered,
        "cancelled": cancelled
    }


def get_dashboard_summary(db: Session, current_user=None, include_deleted: bool = False):
    from app.models.customer import Customer
    from app.models.user import User

    shipment_query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    recent_shipments = (
        shipment_query.order_by(Shipment.id.desc())
        .limit(5)
        .all()
    )

    total_users = db.query(User).count()
    total_customers = db.query(Customer).count()

    return {
        "total_shipments": shipment_query.count(),
        "pending_shipments": shipment_query.filter(Shipment.status == "Pending").count(),
        "in_transit_shipments": shipment_query.filter(Shipment.status == "In Transit").count(),
        "delivered_shipments": shipment_query.filter(Shipment.status == "Delivered").count(),
        "cancelled_shipments": shipment_query.filter(Shipment.status == "Cancelled").count(),
        "total_users": total_users,
        "total_customers": total_customers,
        "recent_shipments": [
            {
                "id": shipment.id,
                "receiver_name": shipment.receiver_name,
                "status": shipment.status,
                "city": shipment.city,
            }
            for shipment in recent_shipments
        ],
    }


def get_reports_shipments(
    db: Session,
    current_user=None,
    date_from=None,
    date_to=None,
    status=None,
    city=None,
    user_id=None,
    include_deleted: bool = False,
):
    query = _apply_visibility_filter(db.query(Shipment), current_user, include_deleted=include_deleted)

    if user_id is not None and current_user is not None and current_user.role == "admin":
        query = query.filter(Shipment.owner_id == user_id)

    if status:
        query = query.filter(Shipment.status == status)

    if city:
        query = query.filter(Shipment.city.ilike(f"%{city}%"))

    filtered_shipments = query.all()

    grouped_counts = {}
    for shipment in filtered_shipments:
        grouped_counts[shipment.status] = grouped_counts.get(shipment.status, 0) + 1

    return {
        "total_shipments": len(filtered_shipments),
        "grouped_counts": grouped_counts,
        "shipments": [
            {
                "id": shipment.id,
                "receiver_name": shipment.receiver_name,
                "status": shipment.status,
                "city": shipment.city,
                "owner_id": shipment.owner_id,
            }
            for shipment in filtered_shipments
        ],
    }