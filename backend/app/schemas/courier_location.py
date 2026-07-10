from pydantic import BaseModel, ConfigDict
from typing import Optional


class CourierLocationCreate(BaseModel):
    """Schema for creating a new courier location"""
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    accuracy: Optional[float] = None
    battery_level: Optional[float] = None
    shipment_id: Optional[int] = None


class CourierLocationResponse(BaseModel):
    """Schema for courier location response"""
    id: int
    courier_id: int
    shipment_id: Optional[int]
    latitude: float
    longitude: float
    speed: float
    heading: float
    accuracy: Optional[float]
    battery_level: Optional[float]
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class ActiveCourierResponse(BaseModel):
    """Schema for active courier with latest location"""
    courier_id: int
    courier_name: str
    latitude: float
    longitude: float
    speed: float
    heading: float
    battery_level: Optional[float]
    shipment_id: Optional[int]
    shipment_receiver: Optional[str]
    shipment_status: Optional[str]
    last_update: str
    accuracy: Optional[float]

    model_config = ConfigDict(from_attributes=True)


class CourierLocationHistoryResponse(BaseModel):
    """Schema for courier location history"""
    id: int
    latitude: float
    longitude: float
    speed: float
    heading: float
    accuracy: Optional[float]
    battery_level: Optional[float]
    created_at: str
    shipment_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)
