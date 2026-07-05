import enum


class PickupRequestStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    assigned = "Assigned"
    picked_up = "Picked Up"
    converted_to_shipment = "Converted To Shipment"
    cancelled = "Cancelled"
