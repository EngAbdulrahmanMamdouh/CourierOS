from sqlalchemy.orm import Session

from app.models.company_settings import CompanySettings
from app.schemas.company_settings import CompanySettingsCreate, CompanySettingsUpdate


def get_settings_by_company_id(db: Session, company_id: int):
    return db.query(CompanySettings).filter(CompanySettings.company_id == company_id).first()


def create_settings(db: Session, settings_data: CompanySettingsCreate):
    existing = get_settings_by_company_id(db, settings_data.company_id)
    if existing:
        raise ValueError("Company settings already exist")

    settings = CompanySettings(
        company_id=settings_data.company_id,
        company_name=settings_data.company_name,
        company_logo=settings_data.company_logo,
        currency=settings_data.currency,
        timezone=settings_data.timezone,
        language=settings_data.language,
        shipment_prefix=settings_data.shipment_prefix,
        invoice_prefix=settings_data.invoice_prefix,
        barcode_prefix=settings_data.barcode_prefix,
        default_cod_percentage=settings_data.default_cod_percentage,
        default_tax_percentage=settings_data.default_tax_percentage,
        sms_provider=settings_data.sms_provider,
        email_provider=settings_data.email_provider,
        whatsapp_provider=settings_data.whatsapp_provider,
        default_shipment_status=settings_data.default_shipment_status,
        support_email=settings_data.support_email,
        support_phone=settings_data.support_phone,
        website=settings_data.website,
        is_active=settings_data.is_active,
    )

    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_settings(db: Session, company_id: int, settings_data: CompanySettingsUpdate):
    settings = get_settings_by_company_id(db, company_id)
    if settings is None:
        return None

    settings.company_name = settings_data.company_name
    settings.company_logo = settings_data.company_logo
    settings.currency = settings_data.currency
    settings.timezone = settings_data.timezone
    settings.language = settings_data.language
    settings.shipment_prefix = settings_data.shipment_prefix
    settings.invoice_prefix = settings_data.invoice_prefix
    settings.barcode_prefix = settings_data.barcode_prefix
    settings.default_cod_percentage = settings_data.default_cod_percentage
    settings.default_tax_percentage = settings_data.default_tax_percentage
    settings.sms_provider = settings_data.sms_provider
    settings.email_provider = settings_data.email_provider
    settings.whatsapp_provider = settings_data.whatsapp_provider
    settings.default_shipment_status = settings_data.default_shipment_status
    settings.support_email = settings_data.support_email
    settings.support_phone = settings_data.support_phone
    settings.website = settings_data.website
    settings.is_active = settings_data.is_active

    db.commit()
    db.refresh(settings)
    return settings
