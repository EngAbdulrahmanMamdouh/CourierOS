from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PaymentBase(BaseModel):
    shipment_id: int | None = None
    cod_id: int | None = None
    customer_id: int
    amount: float
    currency: str = "EGP"
    payment_method: str
    payment_status: str
    transaction_reference: str
    paid_at: datetime | None = None
    notes: str | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_deleted: bool
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
