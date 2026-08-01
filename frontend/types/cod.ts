export type Cod = {
  id: number
  shipment_id: number
  amount: number
  currency: string
  collected: boolean
  collected_at: string | null
  collected_by_driver_id: number | null
  transferred_to_customer: boolean
  transferred_at: string | null
  notes: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type CodCreatePayload = {
  shipment_id: number
  amount: number
  currency?: string
  collected?: boolean
  collected_at?: string | null
  collected_by_driver_id?: number | null
  transferred_to_customer?: boolean
  transferred_at?: string | null
  notes?: string | null
}

export type CodUpdatePayload = CodCreatePayload
