# Model package initializer for import side effects.
# Import all models here to ensure SQLAlchemy metadata is registered.
from app.models.audit_log import AuditLog
from app.models.branch import Branch
from app.models.city import City
from app.models.cod import COD
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.customer import Customer
from app.models.delivery_zone import DeliveryZone
from app.models.driver import Driver
from app.models.import_job import ImportJob
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.pickup_request import PickupRequest
from app.models.pricing_rule import PricingRule
from app.models.shipment import Shipment
from app.models.shipment_history import ShipmentHistory
from app.models.shipment_status import ShipmentStatus
from app.models.user import User
