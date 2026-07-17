from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class TimelineItem(BaseModel):
    status: str
    changed_at: Optional[str]


class TrackingResponse(BaseModel):
    tracking_number: Optional[str]
    status: str
    timeline: List[TimelineItem]
    created_date: Optional[str]
    last_updated: Optional[str]
    created_at: Optional[str]
    delivered_at: Optional[str]
    receiver_name: Optional[str]
    cod_amount: Optional[float]
    destination_city: Optional[str]
    estimated_delivery_date: Optional[str]
    company_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)
