from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class ShipmentBase(BaseModel):
    sender_name: str = Field(..., min_length=2, max_length=100)
    receiver_name: str = Field(..., min_length=2, max_length=100)
    receiver_phone: str = Field(..., min_length=11, max_length=11)
    address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    status: str = Field(default="Pending", max_length=50)
    estimated_delivery_days: int = Field(default=1, ge=1, le=365)
    notes: Optional[str] = Field(default="", max_length=1000)
    cod_amount: float | None = Field(default=0.0, ge=0)


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(ShipmentBase):
    pass


class ShipmentResponse(ShipmentBase):
    id: int
    company_id: int
    tracking_number: str | None = None

    model_config = ConfigDict(from_attributes=True)