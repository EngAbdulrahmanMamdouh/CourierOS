from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PickupRequestBase(BaseModel):
    customer_id: int
    pickup_address: str = Field(..., min_length=5, max_length=255)
    city_id: int
    contact_name: str = Field(..., min_length=2, max_length=100)
    contact_phone: str = Field(..., min_length=11, max_length=20)
    preferred_pickup_date: datetime
    preferred_time_window: str = Field(..., min_length=3, max_length=50)
    notes: str | None = None
    assigned_branch_id: int | None = None
    assigned_driver_id: int | None = None


class PickupRequestCreate(PickupRequestBase):
    pass


class PickupRequestUpdate(PickupRequestBase):
    pass


class PickupRequestStatusUpdate(BaseModel):
    new_status: str


class PickupRequestResponse(PickupRequestBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)
