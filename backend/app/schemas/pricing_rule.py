from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PricingRuleBase(BaseModel):
    source_city_id: int
    destination_city_id: int
    delivery_zone_id: int | None = None
    service_type: str
    min_weight: float
    max_weight: float
    base_price: float
    extra_cost: float = 0.0
    estimated_delivery_days: int
    is_active: bool = True


class PricingRuleCreate(PricingRuleBase):
    pass


class PricingRuleUpdate(PricingRuleBase):
    pass


class PricingRuleResponse(PricingRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_deleted: bool
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
