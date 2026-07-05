from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CityBase(BaseModel):
    name: str
    code: str
    governorate: str
    is_active: bool = True


class CityCreate(CityBase):
    pass


class CityUpdate(CityBase):
    pass


class CityResponse(CityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_deleted: bool
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
