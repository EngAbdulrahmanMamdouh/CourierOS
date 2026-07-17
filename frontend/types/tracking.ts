export type ActiveCourier = {
  courier_id: number
  courier_name: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  battery_level: number | null
  shipment_id: number | null
  shipment_receiver: string | null
  shipment_status: string | null
  last_update: string
  accuracy: number | null
}

export type CourierLocationHistory = {
  id: number
  latitude: number
  longitude: number
  speed: number
  heading: number
  accuracy: number | null
  battery_level: number | null
  created_at: string
  shipment_id: number | null
}

export type TimelineItem = {
  status: string
  changed_at?: string | null
}

export type PublicTrackingResponse = {
  tracking_number: string
  status: string
  timeline: TimelineItem[]
  created_date?: string | null
  last_updated?: string | null
  created_at?: string | null
  delivered_at?: string | null
  receiver_name?: string | null
  cod_amount?: number | null
  destination_city?: string | null
  estimated_delivery_date?: string | null
  company_name?: string | null
}
