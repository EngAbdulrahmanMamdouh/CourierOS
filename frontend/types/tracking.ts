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
