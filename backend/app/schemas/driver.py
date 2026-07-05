from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DriverBase(BaseModel):
    full_name: str
    phone: str
    national_id: str
    license_number: str
    vehicle_type: str
    vehicle_plate: str
    branch_id: int | None = None
    is_active: bool = True


class DriverCreate(DriverBase):
    pass


class DriverUpdate(DriverBase):
    pass


class DriverResponse(DriverBase):
    company_id: int
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
