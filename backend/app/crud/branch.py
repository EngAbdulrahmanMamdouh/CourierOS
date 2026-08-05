from sqlalchemy.orm import Session

from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchUpdate
from app.services.permissions import require_permission
from app.services.tenant_context import is_platform_admin, require_write_company_id


def _ensure_access(current_user, action: str):
    return require_permission(current_user, action, {"view", "create", "update"})


def get_all_branches(db: Session, page: int = 1, size: int = 10, current_user=None, search: str | None = None):
    _ensure_access(current_user, "view")
    offset = (page - 1) * size
    query = db.query(Branch)
    if current_user.role != "admin":
        query = query.filter(Branch.company_id == current_user.company_id)
    if search:
        search_value = f"%{search}%"
        query = query.filter(
            (Branch.name.ilike(search_value)) |
            (Branch.code.ilike(search_value)) |
            (Branch.city.ilike(search_value))
        )
    return query.order_by(Branch.id.desc()).offset(offset).limit(size).all()


def get_branch_by_id(db: Session, branch_id: int, current_user=None):
    _ensure_access(current_user, "view")
    query = db.query(Branch).filter(Branch.id == branch_id)
    if current_user.role != "admin":
        query = query.filter(Branch.company_id == current_user.company_id)
    return query.first()


def create_branch(db: Session, branch_data: BranchCreate, current_user=None):
    _ensure_access(current_user, "create")
    if not is_platform_admin(current_user) and getattr(current_user, "company_id", None) is None:
        raise PermissionError("Company context required")
    company_id = require_write_company_id(current_user, getattr(branch_data, "company_id", None) if hasattr(branch_data, "company_id") else None)
    if company_id is None:
        raise PermissionError("Company context required for this operation")

    branch = Branch(
        name=branch_data.name,
        code=branch_data.code,
        address=branch_data.address,
        city=branch_data.city,
        phone=branch_data.phone,
        manager_id=branch_data.manager_id,
        company_id=company_id,
        is_active=branch_data.is_active,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def update_branch(db: Session, branch_id: int, branch_data: BranchUpdate, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Branch).filter(Branch.id == branch_id)
    if current_user.role != "admin":
        query = query.filter(Branch.company_id == current_user.company_id)
    branch = query.first()
    if branch is None:
        return None
    branch.name = branch_data.name
    branch.code = branch_data.code
    branch.address = branch_data.address
    branch.city = branch_data.city
    branch.phone = branch_data.phone
    branch.manager_id = branch_data.manager_id
    branch.is_active = branch_data.is_active
    db.commit()
    db.refresh(branch)
    return branch


def delete_branch(db: Session, branch_id: int, current_user=None):
    _ensure_access(current_user, "update")
    query = db.query(Branch).filter(Branch.id == branch_id)
    if current_user.role != "admin":
        query = query.filter(Branch.company_id == current_user.company_id)
    branch = query.first()
    if branch is None:
        return None
    db.delete(branch)
    db.commit()
    return branch
