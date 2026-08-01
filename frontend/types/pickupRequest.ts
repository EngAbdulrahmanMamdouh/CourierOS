export type PickupRequest = {
  id: number
  customer_id: number
  pickup_address: string
  city_id: number
  contact_name: string
  contact_phone: string
  preferred_pickup_date: string
  preferred_time_window: string
  notes: string | null
  status: string
  assigned_branch_id: number | null
  assigned_driver_id: number | null
  created_by: number
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export type PickupRequestCreatePayload = {
  customer_id: number
  pickup_address: string
  city_id: number
  contact_name: string
  contact_phone: string
  preferred_pickup_date: string
  preferred_time_window: string
  notes?: string | null
  assigned_branch_id?: number | null
  assigned_driver_id?: number | null
}

export type PickupRequestUpdatePayload = PickupRequestCreatePayload
