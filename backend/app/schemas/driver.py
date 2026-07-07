from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class DriverBase(BaseModel):
    full_name: str
    employee_code: str | None = None
    national_id: str
    phone: str
    email: str | None = None
    vehicle_type: str
    vehicle_plate: str
    license_number: str
    license_expiry: datetime | None = None
    status: str = "Active"
    availability: str = "Available"
    branch_id: int | None = None
    is_active: bool = True

    @field_validator("license_expiry", mode="before")
    @classmethod
    def normalize_license_expiry(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            if value == "":
                return None
        return value


class DriverCreate(DriverBase):
    pass


class DriverUpdate(DriverBase):
    pass


class DriverResponse(DriverBase):
    company_id: int
    branch_name: str | None = None
    assigned_shipments_count: int = 0
    delivered_today_count: int = 0
    pending_deliveries_count: int = 0
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
