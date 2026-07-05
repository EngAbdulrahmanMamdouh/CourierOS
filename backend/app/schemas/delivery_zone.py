from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DeliveryZoneBase(BaseModel):
    city_id: int
    zone_name: str
    delivery_days: str
    extra_cost: float
    is_active: bool = True


class DeliveryZoneCreate(DeliveryZoneBase):
    pass


class DeliveryZoneUpdate(DeliveryZoneBase):
    pass


class DeliveryZoneResponse(DeliveryZoneBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_deleted: bool
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
