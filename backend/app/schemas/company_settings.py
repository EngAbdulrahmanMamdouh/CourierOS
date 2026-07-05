from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, constr, field_validator


class CompanySettingsBase(BaseModel):
    company_id: int
    company_name: str = Field(..., min_length=1, max_length=255)
    company_logo: str | None = None
    currency: constr(min_length=1, max_length=10)
    timezone: constr(min_length=1, max_length=100)
    language: constr(min_length=1, max_length=50)
    shipment_prefix: constr(min_length=1, max_length=50)
    invoice_prefix: constr(min_length=1, max_length=50)
    barcode_prefix: constr(min_length=1, max_length=50)
    default_cod_percentage: int = Field(..., ge=0, le=100)
    default_tax_percentage: int = Field(..., ge=0, le=100)
    sms_provider: str | None = None
    email_provider: str | None = None
    whatsapp_provider: str | None = None
    default_shipment_status: str = Field(..., min_length=1, max_length=100)
    support_email: EmailStr | None = None
    support_phone: str | None = None
    website: str | None = None
    is_active: bool = True

    @field_validator("currency")
    def validate_currency(cls, value: str):
        if len(value.strip()) == 0:
            raise ValueError("currency must not be empty")
        return value

    @field_validator("timezone")
    def validate_timezone(cls, value: str):
        if len(value.strip()) == 0:
            raise ValueError("timezone must not be empty")
        return value

    @field_validator("language")
    def validate_language(cls, value: str):
        if len(value.strip()) == 0:
            raise ValueError("language must not be empty")
        return value


class CompanySettingsCreate(CompanySettingsBase):
    pass


class CompanySettingsUpdate(CompanySettingsBase):
    pass


class CompanySettingsResponse(CompanySettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
