export type DeliveryZone = {
  id: number
  city_id: number
  zone_name: string
  delivery_days: string
  extra_cost: number
  is_active: boolean
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type DeliveryZoneCreatePayload = {
  city_id: number
  zone_name: string
  delivery_days: string
  extra_cost: number
  is_active: boolean
}

export type DeliveryZoneUpdatePayload = DeliveryZoneCreatePayload
