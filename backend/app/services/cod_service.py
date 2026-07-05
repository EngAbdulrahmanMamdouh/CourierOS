from app.utils.datetime_utils import parse_datetime


def normalize_cod_payload(payload):
    payload.collected_at = parse_datetime(getattr(payload, "collected_at", None))
    payload.transferred_at = parse_datetime(getattr(payload, "transferred_at", None))
    return payload
