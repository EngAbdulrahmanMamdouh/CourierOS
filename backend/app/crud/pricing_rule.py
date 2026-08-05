from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.pricing_rule import PricingRule
from app.schemas.pricing_rule import PricingRuleCreate, PricingRuleUpdate
from app.services.audit_service import create_audit_log
from app.services.permissions import require_permission
from app.services.tenant_context import is_platform_admin, require_write_company_id, require_company_context


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "read"})


def _has_overlap(db: Session, source_city_id: int, destination_city_id: int, delivery_zone_id: int | None, service_type: str, min_weight: float, max_weight: float, exclude_id: int | None = None, company_id: int | None = None):
    query = db.query(PricingRule).filter(
        PricingRule.source_city_id == source_city_id,
        PricingRule.destination_city_id == destination_city_id,
        PricingRule.service_type == service_type,
        PricingRule.is_deleted == False,
    )
    if company_id is not None:
        query = query.filter(PricingRule.company_id == company_id)
    if delivery_zone_id is not None:
        query = query.filter(PricingRule.delivery_zone_id == delivery_zone_id)
    else:
        query = query.filter(PricingRule.delivery_zone_id.is_(None))

    if exclude_id is not None:
        query = query.filter(PricingRule.id != exclude_id)

    existing_rules = query.all()
    for rule in existing_rules:
        existing_min = float(rule.min_weight)
        existing_max = float(rule.max_weight)
        candidate_min = float(min_weight)
        candidate_max = float(max_weight)

        if candidate_min <= existing_max and candidate_max >= existing_min:
            return True
    return False


def get_all_pricing_rules(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(PricingRule).filter(PricingRule.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(PricingRule.company_id == company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(PricingRule.service_type.ilike(search_value))
    return query.order_by(PricingRule.id.desc()).offset(offset).limit(size).all()


def get_pricing_rule_by_id(db: Session, pricing_rule_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(PricingRule).filter(PricingRule.id == pricing_rule_id, PricingRule.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(PricingRule.company_id == company_id)
    return query.first()


def create_pricing_rule(db: Session, pricing_data: PricingRuleCreate, current_user=None):
    _ensure_access(current_user, "create")
    if not is_platform_admin(current_user) and getattr(current_user, "company_id", None) is None:
        raise PermissionError("Company context required")
    if float(pricing_data.min_weight) > float(pricing_data.max_weight):
        raise ValueError("min_weight cannot be greater than max_weight")

    company_id = require_write_company_id(current_user, getattr(pricing_data, "company_id", None))
    if company_id is None:
        raise PermissionError("Company context required for this operation")
    if _has_overlap(
        db=db,
        source_city_id=pricing_data.source_city_id,
        destination_city_id=pricing_data.destination_city_id,
        delivery_zone_id=pricing_data.delivery_zone_id,
        service_type=pricing_data.service_type,
        min_weight=pricing_data.min_weight,
        max_weight=pricing_data.max_weight,
        company_id=company_id,
    ):
        raise ValueError("Overlapping pricing rule exists for this route and weight range")

    pricing_rule = PricingRule(
        source_city_id=pricing_data.source_city_id,
        destination_city_id=pricing_data.destination_city_id,
        delivery_zone_id=pricing_data.delivery_zone_id,
        company_id=company_id,
        service_type=pricing_data.service_type,
        min_weight=pricing_data.min_weight,
        max_weight=pricing_data.max_weight,
        base_price=pricing_data.base_price,
        extra_cost=pricing_data.extra_cost,
        estimated_delivery_days=pricing_data.estimated_delivery_days,
        is_active=pricing_data.is_active,
    )
    db.add(pricing_rule)
    db.commit()
    db.refresh(pricing_rule)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=company_id,
        action="create",
        entity="pricing_rule",
        entity_id=pricing_rule.id,
        description=f"Created pricing rule {pricing_rule.service_type}",
    )
    return pricing_rule


def update_pricing_rule(db: Session, pricing_rule_id: int, pricing_data: PricingRuleUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(PricingRule).filter(PricingRule.id == pricing_rule_id, PricingRule.is_deleted == False)
    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
        query = query.filter(PricingRule.company_id == company_id)
    pricing_rule = query.first()
    if pricing_rule is None:
        return None

    if float(pricing_data.min_weight) > float(pricing_data.max_weight):
        raise ValueError("min_weight cannot be greater than max_weight")

    if not is_platform_admin(current_user):
        company_id = require_company_context(current_user)
    else:
        company_id = getattr(pricing_data, "company_id", None)
        if company_id is None:
            company_id = pricing_rule.company_id
    if company_id is None:
        raise PermissionError("Company context required for this operation")

    if _has_overlap(
        db=db,
        source_city_id=pricing_data.source_city_id,
        destination_city_id=pricing_data.destination_city_id,
        delivery_zone_id=pricing_data.delivery_zone_id,
        service_type=pricing_data.service_type,
        min_weight=pricing_data.min_weight,
        max_weight=pricing_data.max_weight,
        exclude_id=pricing_rule.id,
        company_id=company_id,
    ):
        raise ValueError("Overlapping pricing rule exists for this route and weight range")

    pricing_rule.source_city_id = pricing_data.source_city_id
    pricing_rule.destination_city_id = pricing_data.destination_city_id
    pricing_rule.delivery_zone_id = pricing_data.delivery_zone_id
    pricing_rule.company_id = company_id
    pricing_rule.service_type = pricing_data.service_type
    pricing_rule.min_weight = pricing_data.min_weight
    pricing_rule.max_weight = pricing_data.max_weight
    pricing_rule.base_price = pricing_data.base_price
    pricing_rule.extra_cost = pricing_data.extra_cost
    pricing_rule.estimated_delivery_days = pricing_data.estimated_delivery_days
    pricing_rule.is_active = pricing_data.is_active
    db.commit()
    db.refresh(pricing_rule)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="update",
        entity="pricing_rule",
        entity_id=pricing_rule.id,
        description=f"Updated pricing rule {pricing_rule.service_type}",
    )
    return pricing_rule


def delete_pricing_rule(db: Session, pricing_rule_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(PricingRule).filter(PricingRule.id == pricing_rule_id, PricingRule.is_deleted == False)
    if current_user.role != "admin":
        company_id = getattr(current_user, "company_id", None)
        if company_id is not None:
            query = query.filter(PricingRule.company_id == company_id)
    pricing_rule = query.first()
    if pricing_rule is None:
        return None
    pricing_rule.is_deleted = True
    pricing_rule.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pricing_rule)
    create_audit_log(
        db,
        actor_id=getattr(current_user, "id", None),
        company_id=getattr(current_user, "company_id", None),
        action="delete",
        entity="pricing_rule",
        entity_id=pricing_rule.id,
        description=f"Soft deleted pricing rule {pricing_rule.service_type}",
    )
    return pricing_rule
