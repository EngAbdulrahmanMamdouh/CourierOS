from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CODBase(BaseModel):
    shipment_id: int
    amount: float
    currency: str = "EGP"
    collected: bool = False
    collected_at: datetime | None = None
    collected_by_driver_id: int | None = None
    transferred_to_customer: bool = False
    transferred_at: datetime | None = None
    notes: str | None = None


class CODCreate(CODBase):
    pass


class CODUpdate(CODBase):
    pass


class CODResponse(CODBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_deleted: bool
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
