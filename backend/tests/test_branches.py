from types import SimpleNamespace

import pytest

from app.crud import branch as branch_crud
from app.database import Base, SessionLocal, engine


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_branch_crud_search_pagination_and_permissions():
    db = SessionLocal()
    try:
        admin = SimpleNamespace(id=1, role="admin", company_id=1)
        employee = SimpleNamespace(id=2, role="employee", company_id=1)
        regular_user = SimpleNamespace(id=3, role="user", company_id=1)

        created = branch_crud.create_branch(
            db=db,
            branch_data=SimpleNamespace(
                name="Main Branch",
                code="MB01",
                address="1 Main St",
                city="Cairo",
                phone="01000000001",
                manager_id=None,
                is_active=True,
            ),
            current_user=admin,
        )
        assert created.code == "MB01"

        branch_crud.create_branch(
            db=db,
            branch_data=SimpleNamespace(
                name="Alex Branch",
                code="AB02",
                address="2 Nile St",
                city="Alex",
                phone="01000000002",
                manager_id=None,
                is_active=True,
            ),
            current_user=admin,
        )

        page_one = branch_crud.get_all_branches(db=db, page=1, size=1, current_user=employee)
        assert len(page_one) == 1

        search_results = branch_crud.get_all_branches(db=db, page=1, size=10, search="Alex", current_user=employee)
        assert len(search_results) == 1

        branch = branch_crud.get_branch_by_id(db=db, branch_id=created.id, current_user=employee)
        assert branch is not None
        assert branch.city == "Cairo"

        updated = branch_crud.update_branch(
            db=db,
            branch_id=created.id,
            branch_data=SimpleNamespace(
                name="Main Branch Updated",
                code="MB01",
                address="1 Main St",
                city="Cairo",
                phone="01000000001",
                manager_id=None,
                is_active=True,
            ),
            current_user=admin,
        )
        assert updated.name == "Main Branch Updated"

        with pytest.raises(PermissionError):
            branch_crud.create_branch(
                db=db,
                branch_data=SimpleNamespace(
                    name="Forbidden Branch",
                    code="FB03",
                    address="3 Road",
                    city="Luxor",
                    phone="01000000003",
                    manager_id=None,
                    is_active=True,
                ),
                current_user=regular_user,
            )

        deleted = branch_crud.delete_branch(db=db, branch_id=created.id, current_user=admin)
        assert deleted is not None
    finally:
        db.close()
