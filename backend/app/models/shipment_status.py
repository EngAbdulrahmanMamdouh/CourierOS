import enum


class ShipmentStatus(str, enum.Enum):
    pending = "Pending"
    in_transit = "In Transit"
    delivered = "Delivered"
    cancelled = "Cancelled"