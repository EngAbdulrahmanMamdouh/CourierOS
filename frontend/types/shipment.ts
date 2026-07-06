import type { ShipmentStatus } from '@/constants/shipment'

export type ShipmentListItem = {
  id: number
  tracking_number: string | null
  sender_name: string
  receiver_name: string
  receiver_phone: string
  address: string
  city: string
  status: ShipmentStatus
  estimated_delivery_days: number
  notes: string | null
  cod_amount: number | null
  created_at: string
}

export type ShipmentCreatePayload = {
  sender_name: string
  receiver_name: string
  receiver_phone: string
  address: string
  city: string
  status: ShipmentStatus
  estimated_delivery_days: number
  notes: string
  cod_amount: number
}

export type ShipmentResponse = ShipmentListItem
