from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.branch import Branch
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.payment import Payment
from app.models.shipment import Shipment
from app.models.pickup_request import PickupRequest
from app.models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def _apply_visibility_filter(query, current_user=None):
    query = query.filter(Shipment.is_deleted == False)

    if current_user is None:
        return query

    if current_user.role == "admin":
        return query

    if current_user.company_id is not None:
        query = query.filter(Shipment.company_id == current_user.company_id)

        if current_user.role in ("company_admin", "user"):
            return query

    if current_user.role == "employee":
        return query.filter(
            (Shipment.owner_id == current_user.id) |
            (Shipment.assigned_to == current_user.id)
        )

    return query


def _apply_visibility_filter_payment(query, current_user=None):
    if current_user is None or current_user.role == "admin":
        return query
    if current_user.company_id is not None:
        return query.filter(Payment.company_id == current_user.company_id)
    return query


def _apply_visibility_filter_pickup(query, current_user=None):
    if current_user is None or current_user.role == "admin":
        return query
    if current_user.company_id is not None:
        return query.join(PickupRequest.customer).filter(Customer.company_id == current_user.company_id)
    return query


def _apply_visibility_filter_entity(query, entity, current_user=None):
    if current_user is None or current_user.role == "admin":
        return query
    company_id = getattr(current_user, "company_id", None)
    if company_id is not None:
        return query.filter(entity.company_id == company_id)
    return query


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    thirty_days = today - timedelta(days=29)
    first_day_of_month = today.replace(day=1)

    shipment_query = _apply_visibility_filter(db.query(Shipment), current_user)

    total_shipments = shipment_query.count()
    pending = shipment_query.filter(Shipment.status == "Pending").count()
    in_transit = shipment_query.filter(Shipment.status == "In Transit").count()
    delivered = shipment_query.filter(Shipment.status == "Delivered").count()
    cancelled = shipment_query.filter(Shipment.status == "Cancelled").count()

    last_shipments = (
        shipment_query.order_by(Shipment.created_at.desc())
        .limit(5)
        .all()
    )

    payment_query = _apply_visibility_filter_payment(db.query(Payment), current_user).filter(Payment.is_deleted == False)
    latest_payments = (
        payment_query.order_by(Payment.created_at.desc())
        .limit(5)
        .all()
    )

    pickup_query = _apply_visibility_filter_pickup(db.query(PickupRequest), current_user).filter(PickupRequest.is_deleted == False)
    latest_pickups = (
        pickup_query.order_by(PickupRequest.created_at.desc())
        .limit(5)
        .all()
    )

    top_customers_query = _apply_visibility_filter_entity(db.query(Customer), Customer, current_user)
    top_customers = (
        top_customers_query
        .join(Shipment, Shipment.customer_id == Customer.id)
        .filter(Shipment.is_deleted == False)
        .group_by(Customer.id)
        .order_by(func.count(Shipment.id).desc())
        .limit(5)
        .all()
    )

    top_drivers = (
        _apply_visibility_filter_entity(db.query(Driver), Driver, current_user)
        .order_by(Driver.created_at.desc())
        .limit(5)
        .all()
    )

    top_branches = (
        _apply_visibility_filter_entity(db.query(Branch), Branch, current_user)
        .order_by(Branch.created_at.desc())
        .limit(5)
        .all()
    )

    today_shipments = shipment_query.filter(func.date(Shipment.created_at) == today).count()

    cod_summary = payment_query.with_entities(
        func.sum(case((Payment.payment_status == "Pending", Payment.amount), else_=0)).label("pending_amount"),
        func.sum(case((Payment.payment_status == "Completed", Payment.amount), else_=0)).label("completed_amount"),
        func.count(case((Payment.payment_status == "Pending", 1))).label("pending_count"),
        func.count(case((Payment.payment_status == "Completed", 1))).label("completed_count")
    ).first()

    shipments_by_status = (
        shipment_query.with_entities(Shipment.status, func.count(Shipment.id).label("count"))
        .group_by(Shipment.status)
        .all()
    )

    shipments_by_day = (
        shipment_query.with_entities(
            func.date(Shipment.created_at).label("day"),
            func.count(Shipment.id).label("count")
        )
        .filter(Shipment.created_at >= thirty_days)
        .group_by(func.date(Shipment.created_at))
        .order_by(func.date(Shipment.created_at))
        .all()
    )

    monthly_growth = (
        shipment_query.with_entities(
            func.strftime("%Y-%m", Shipment.created_at).label("month"),
            func.count(Shipment.id).label("count")
        )
        .filter(Shipment.created_at >= first_day_of_month - timedelta(days=365))
        .group_by(func.strftime("%Y-%m", Shipment.created_at))
        .order_by(func.strftime("%Y-%m", Shipment.created_at))
        .all()
    )

    active_cities = (
        shipment_query.with_entities(Shipment.city, func.count(Shipment.id).label("count"))
        .group_by(Shipment.city)
        .order_by(func.count(Shipment.id).desc())
        .limit(5)
        .all()
    )

    delivery_shipments = shipment_query.filter(
        Shipment.status == "Delivered",
        Shipment.delivered_at.isnot(None)
    ).all()

    on_time = 0
    delayed = 0
    for shipment in delivery_shipments:
        delivered_at = shipment.delivered_at
        created_at = shipment.created_at

        if delivered_at is None or created_at is None:
            continue

        if delivered_at.tzinfo is None:
            delivered_at = delivered_at.replace(tzinfo=timezone.utc)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        due_date = created_at + timedelta(days=shipment.estimated_delivery_days or 0)
        if delivered_at.date() <= due_date.date():
            on_time += 1
        else:
            delayed += 1

    return {
        "statistics": {
            "total_shipments": total_shipments,
            "pending": pending,
            "in_transit": in_transit,
            "delivered": delivered,
            "cancelled": cancelled,
            "today_shipments": today_shipments,
        },
        "charts": {
            "shipments_by_status": [{"status": status, "count": count} for status, count in shipments_by_status],
            "shipments_by_day": [
                {"day": day.isoformat() if hasattr(day, "isoformat") else str(day), "count": count}
                for day, count in shipments_by_day
            ],
            "monthly_growth": [{"month": month, "count": count} for month, count in monthly_growth],
            "most_active_cities": [{"city": city, "count": count} for city, count in active_cities],
        },
        "recent_shipments": [
            {
                "id": shipment.id,
                "receiver_name": shipment.receiver_name,
                "status": shipment.status,
                "city": shipment.city,
                "tracking_number": shipment.tracking_number,
                "created_at": shipment.created_at.isoformat(),
            }
            for shipment in last_shipments
        ],
        "latest_payments": [
            {
                "id": payment.id,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "payment_method": payment.payment_method,
                "payment_status": payment.payment_status,
                "transaction_reference": payment.transaction_reference,
                "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
                "created_at": payment.created_at.isoformat(),
            }
            for payment in latest_payments
        ],
        "latest_pickup_requests": [
            {
                "id": pickup.id,
                "customer_id": pickup.customer_id,
                "pickup_address": pickup.pickup_address,
                "city_id": pickup.city_id,
                "contact_name": pickup.contact_name,
                "preferred_pickup_date": pickup.preferred_pickup_date.isoformat(),
                "preferred_time_window": pickup.preferred_time_window,
                "created_at": pickup.created_at.isoformat(),
            }
            for pickup in latest_pickups
        ],
        "top_drivers": [
            {"id": driver.id, "full_name": driver.full_name, "vehicle_plate": driver.vehicle_plate}
            for driver in top_drivers
        ],
        "top_branches": [
            {"id": branch.id, "name": branch.name, "city": branch.city}
            for branch in top_branches
        ],
        "top_customers": [
            {"id": customer.id, "full_name": customer.full_name, "company_name": customer.company_name}
            for customer in top_customers
        ],
        "cod_summary": {
            "pending_amount": float(cod_summary.pending_amount or 0),
            "completed_amount": float(cod_summary.completed_amount or 0),
            "pending_count": int(cod_summary.pending_count or 0),
            "completed_count": int(cod_summary.completed_count or 0),
        },
        "delivery_performance": {
            "on_time": on_time,
            "delayed": delayed,
        },
    }
