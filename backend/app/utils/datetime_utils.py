from datetime import datetime


def parse_datetime(value):
    if value is None or isinstance(value, datetime):
        return value

    if isinstance(value, str):
        cleaned = value.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(cleaned)
        except ValueError:
            return value

    return value
