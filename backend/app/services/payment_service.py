from app.utils.datetime_utils import parse_datetime


def normalize_payment_payload(payload):
    payload.paid_at = parse_datetime(getattr(payload, "paid_at", None))
    return payload


def validate_payment_method(payment_method: str):
    allowed = {"Cash", "Bank Transfer", "Wallet", "Credit Card"}
    if payment_method not in allowed:
        raise ValueError(f"Unsupported payment method: {payment_method}")
    return True
