from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FinanceSummaryResponse(BaseModel):
    total_cod_due: float
    total_cod_collected: float
    total_cod_pending: float
    total_payments_received: float
    outstanding_balance: float


class CustomerLedgerShipmentItem(BaseModel):
    id: int
    tracking_number: str | None
    cod_amount: float
    status: str
    created_at: datetime | None
    delivered_at: datetime | None


class CustomerLedgerPaymentItem(BaseModel):
    id: int
    shipment_id: int | None
    cod_id: int | None
    amount: float
    currency: str
    payment_method: str
    payment_status: str
    transaction_reference: str
    paid_at: datetime | None
    created_at: datetime
    notes: str | None


class CustomerLedgerResponse(BaseModel):
    customer_id: int
    customer_name: str | None
    total_cod_due: float
    total_payments: float
    outstanding_balance: float
    shipments: list[CustomerLedgerShipmentItem]
    payments: list[CustomerLedgerPaymentItem]


class CourierSettlementItem(BaseModel):
    shipment_id: int
    cod_amount: float
    collected: bool
    collected_at: datetime | None
    customer_name: str | None


class CourierSettlementResponse(BaseModel):
    driver_id: int
    driver_name: str | None
    total_collected: float
    total_pending: float
    settlements: list[CourierSettlementItem]


class CodCollectionResponse(BaseModel):
    success: bool
    cod_id: int
    payment_id: int
    collected_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
