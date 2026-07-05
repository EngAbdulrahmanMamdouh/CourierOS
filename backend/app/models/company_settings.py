from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"
    __table_args__ = (
        UniqueConstraint("company_id", "shipment_prefix", name="uq_company_shipment_prefix"),
        UniqueConstraint("company_id", "invoice_prefix", name="uq_company_invoice_prefix"),
        UniqueConstraint("company_id", "barcode_prefix", name="uq_company_barcode_prefix"),
    )

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, unique=True)
    company_name = Column(String, nullable=False)
    company_logo = Column(String, nullable=True)
    currency = Column(String, nullable=False)
    timezone = Column(String, nullable=False)
    language = Column(String, nullable=False)
    shipment_prefix = Column(String, nullable=False)
    invoice_prefix = Column(String, nullable=False)
    barcode_prefix = Column(String, nullable=False)
    default_cod_percentage = Column(Integer, nullable=False, default=0)
    default_tax_percentage = Column(Integer, nullable=False, default=0)
    sms_provider = Column(String, nullable=True)
    email_provider = Column(String, nullable=True)
    whatsapp_provider = Column(String, nullable=True)
    default_shipment_status = Column(String, nullable=False)
    support_email = Column(String, nullable=True)
    support_phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
