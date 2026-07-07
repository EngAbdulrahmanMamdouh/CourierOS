export type Branch = {
  id: number
  name: string
  code: string
  city: string
  address: string
  phone: string
  manager_id?: number | null
  manager_name?: string | null
  is_active: boolean
  company_id: number
  created_at: string
  updated_at: string
}

export type BranchCreatePayload = {
  name: string
  code: string
  city: string
  address: string
  phone: string
  manager_name: string
  is_active: boolean
}
