from types import SimpleNamespace

import pytest

from app.crud import city as city_crud
from app.crud import delivery_zone as zone_crud
from app.database import Base, SessionLocal, engine


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_city_and_zone_crud_search_soft_delete_and_permissions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin")
        employee = SimpleNamespace(id=2, role="employee")
        regular_user = SimpleNamespace(id=3, role="user")

        city = city_crud.create_city(
            db=db,
            city_data=SimpleNamespace(
                name="Cairo",
                code="CAI",
                governorate="Cairo",
                is_active=True,
            ),
            current_user=admin,
        )
        assert city.code == "CAI"

        zone = zone_crud.create_delivery_zone(
            db=db,
            zone_data=SimpleNamespace(
                city_id=city.id,
                zone_name="Downtown",
                delivery_days="Mon-Wed-Fri",
                extra_cost=15.5,
                is_active=True,
            ),
            current_user=admin,
        )
        assert zone.zone_name == "Downtown"

        page_results = city_crud.get_all_cities(db=db, page=1, size=10, current_user=employee)
        assert len(page_results) == 1

        search_results = city_crud.get_all_cities(db=db, page=1, size=10, search="Cai", current_user=employee)
        assert len(search_results) == 1

        saved_zone = zone_crud.get_delivery_zone_by_id(db=db, zone_id=zone.id, current_user=employee)
        assert saved_zone is not None
        assert saved_zone.extra_cost == 15.5

        updated_zone = zone_crud.update_delivery_zone(
            db=db,
            zone_id=zone.id,
            zone_data=SimpleNamespace(
                city_id=city.id,
                zone_name="New Downtown",
                delivery_days="Mon-Wed-Fri",
                extra_cost=18.0,
                is_active=True,
            ),
            current_user=admin,
        )
        assert updated_zone.zone_name == "New Downtown"

        with pytest.raises(PermissionError):
            city_crud.create_city(
                db=db,
                city_data=SimpleNamespace(
                    name="Alex",
                    code="ALX",
                    governorate="Alexandria",
                    is_active=True,
                ),
                current_user=regular_user,
            )

        deleted_city = city_crud.delete_city(db=db, city_id=city.id, current_user=admin)
        assert deleted_city is not None
        assert deleted_city.is_deleted is True

        soft_deleted_zone = zone_crud.get_delivery_zone_by_id(db=db, zone_id=zone.id, current_user=admin)
        assert soft_deleted_zone is None
    finally:
        db.close()
