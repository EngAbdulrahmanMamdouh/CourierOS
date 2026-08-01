export type CompanySettings = {
  id: number
  company_id: number
  company_name: string
  currency: string
  timezone: string
  language: string
  shipment_prefix: string
  tracking_prefix: string
  cod_percentage: number
  tax_percentage: number
  shipping_providers: string
  support_phone: string | null
  support_email: string | null
  is_active: boolean
}

export type CompanySettingsPayload = {
  company_id: number
  company_name: string
  company_logo?: string | null
  currency: string
  timezone: string
  language: string
  shipment_prefix: string
  invoice_prefix: string
  barcode_prefix: string
  default_cod_percentage: number
  default_tax_percentage: number
  sms_provider?: string | null
  email_provider?: string | null
  whatsapp_provider?: string | null
  default_shipment_status: string
  support_email?: string | null
  support_phone?: string | null
  website?: string | null
  is_active: boolean
}
