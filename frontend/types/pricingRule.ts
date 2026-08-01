export type PricingRule = {
  id: number
  source_city_id: number
  destination_city_id: number
  delivery_zone_id: number | null
  service_type: string
  min_weight: number
  max_weight: number
  base_price: number
  extra_cost: number
  estimated_delivery_days: number
  is_active: boolean
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type PricingRuleCreatePayload = {
  source_city_id: number
  destination_city_id: number
  delivery_zone_id: number | null
  service_type: string
  min_weight: number
  max_weight: number
  base_price: number
  extra_cost: number
  estimated_delivery_days: number
  is_active: boolean
}
