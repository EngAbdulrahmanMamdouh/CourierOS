from types import SimpleNamespace

import pytest

from app.crud import city as city_crud
from app.crud import delivery_zone as zone_crud
from app.crud import pricing_rule as pricing_crud
from app.crud import shipment as shipment_crud
from app.database import Base, SessionLocal, engine


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_pricing_rule_crud_validation_and_soft_delete():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin")
        employee = SimpleNamespace(id=2, role="employee")
        regular_user = SimpleNamespace(id=3, role="user")

        source_city = city_crud.create_city(
            db=db,
            city_data=SimpleNamespace(name="Cairo", code="CAI", governorate="Cairo", is_active=True),
            current_user=admin,
        )
        destination_city = city_crud.create_city(
            db=db,
            city_data=SimpleNamespace(name="Alexandria", code="ALX", governorate="Alexandria", is_active=True),
            current_user=admin,
        )
        delivery_zone = zone_crud.create_delivery_zone(
            db=db,
            zone_data=SimpleNamespace(city_id=source_city.id, zone_name="Downtown", delivery_days="Mon-Wed", extra_cost=10.0, is_active=True),
            current_user=admin,
        )

        rule = pricing_crud.create_pricing_rule(
            db=db,
            pricing_data=SimpleNamespace(
                source_city_id=source_city.id,
                destination_city_id=destination_city.id,
                delivery_zone_id=delivery_zone.id,
                service_type="Express",
                min_weight=1.0,
                max_weight=5.0,
                base_price=20.0,
                extra_cost=2.0,
                estimated_delivery_days=2,
                is_active=True,
            ),
            current_user=admin,
        )
        assert rule.base_price == 20.0

        with pytest.raises(ValueError):
            pricing_crud.create_pricing_rule(
                db=db,
                pricing_data=SimpleNamespace(
                    source_city_id=source_city.id,
                    destination_city_id=destination_city.id,
                    delivery_zone_id=delivery_zone.id,
                    service_type="Express",
                    min_weight=4.0,
                    max_weight=6.0,
                    base_price=25.0,
                    extra_cost=2.5,
                    estimated_delivery_days=3,
                    is_active=True,
                ),
                current_user=admin,
            )

        with pytest.raises(ValueError):
            pricing_crud.create_pricing_rule(
                db=db,
                pricing_data=SimpleNamespace(
                    source_city_id=source_city.id,
                    destination_city_id=destination_city.id,
                    delivery_zone_id=delivery_zone.id,
                    service_type="Standard",
                    min_weight=6.0,
                    max_weight=5.0,
                    base_price=15.0,
                    extra_cost=1.0,
                    estimated_delivery_days=4,
                    is_active=True,
                ),
                current_user=admin,
            )

        results = pricing_crud.get_all_pricing_rules(db=db, page=1, size=10, current_user=employee)
        assert len(results) == 1

        with pytest.raises(PermissionError):
            pricing_crud.create_pricing_rule(
                db=db,
                pricing_data=SimpleNamespace(
                    source_city_id=source_city.id,
                    destination_city_id=destination_city.id,
                    delivery_zone_id=delivery_zone.id,
                    service_type="Priority",
                    min_weight=1.0,
                    max_weight=3.0,
                    base_price=30.0,
                    extra_cost=3.0,
                    estimated_delivery_days=1,
                    is_active=True,
                ),
                current_user=regular_user,
            )

        deleted = pricing_crud.delete_pricing_rule(db=db, pricing_rule_id=rule.id, current_user=admin)
        assert deleted is not None
        assert deleted.is_deleted is True

        assert pricing_crud.get_pricing_rule_by_id(db=db, pricing_rule_id=rule.id, current_user=admin) is None
    finally:
        db.close()


def test_shipment_creation_uses_pricing_rule_for_shipping_price():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=1)

        source_city = city_crud.create_city(
            db=db,
            city_data=SimpleNamespace(name="Cairo", code="CAI", governorate="Cairo", is_active=True),
            current_user=admin,
        )
        destination_city = city_crud.create_city(
            db=db,
            city_data=SimpleNamespace(name="Alexandria", code="ALX", governorate="Alexandria", is_active=True),
            current_user=admin,
        )
        zone = zone_crud.create_delivery_zone(
            db=db,
            zone_data=SimpleNamespace(city_id=source_city.id, zone_name="Downtown", delivery_days="Mon-Wed", extra_cost=10.0, is_active=True),
            current_user=admin,
        )

        pricing_crud.create_pricing_rule(
            db=db,
            pricing_data=SimpleNamespace(
                source_city_id=source_city.id,
                destination_city_id=destination_city.id,
                delivery_zone_id=zone.id,
                service_type="Express",
                min_weight=1.0,
                max_weight=5.0,
                base_price=20.0,
                extra_cost=2.0,
                estimated_delivery_days=2,
                is_active=True,
            ),
            current_user=admin,
        )

        shipment = shipment_crud.create_shipment(
            db=db,
            shipment_data=SimpleNamespace(
                sender_name="Alice",
                receiver_name="Bob",
                receiver_phone="01000000000",
                address="123 Main St",
                city="Alexandria",
                origin_city="Cairo",
                destination_city="Alexandria",
                delivery_zone="Downtown",
                weight=6.0,
                cod_fee=3.0,
                status="Pending",
                notes="",
            ),
            owner_id=admin.id,
            company_id=admin.company_id,
        )

        assert shipment.shipping_price == 25.0
    finally:
        db.close()
