from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BranchBase(BaseModel):
    name: str
    code: str
    address: str
    city: str
    phone: str
    manager_id: int | None = None
    is_active: bool = True


class BranchCreate(BranchBase):
    pass


class BranchUpdate(BranchBase):
    pass


class BranchResponse(BranchBase):
    company_id: int
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
