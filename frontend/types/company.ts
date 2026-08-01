export type Company = {
  id: number
  name: string
  code: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  tax_number: string | null
  commercial_register: string | null
  logo_url: string | null
  subscription_plan: string | null
  subscription_status: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CompanyCreatePayload = {
  name: string
  code: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  tax_number?: string | null
  commercial_register?: string | null
  logo_url?: string | null
  subscription_plan?: string | null
  subscription_status?: string | null
  is_active?: boolean
}

export type CompanyUpdatePayload = CompanyCreatePayload
