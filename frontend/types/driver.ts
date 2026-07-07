export type DriverCreatePayload = {
  full_name: string
  employee_code?: string
  national_id: string
  phone: string
  email?: string
  vehicle_type: string
  vehicle_plate: string
  license_number: string
  license_expiry?: string
  status: string
  availability: string
  branch_id?: number | null
  is_active: boolean
}

export type DriverResponse = DriverCreatePayload & {
  id: number
  company_id: number
  branch_name?: string | null
  assigned_shipments_count: number
  delivered_today_count: number
  pending_deliveries_count: number
  created_at: string
  updated_at: string
}

export type DriverListItem = DriverResponse
