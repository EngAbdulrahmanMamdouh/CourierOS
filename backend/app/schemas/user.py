from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    phone: str | None = None
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserCreate(UserBase):
    password: str
    company_id: int | None = None


class UserResponse(UserBase):
    id: int
    role: str
    company_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    username: str
    password: str