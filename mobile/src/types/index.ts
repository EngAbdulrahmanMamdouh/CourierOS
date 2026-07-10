export type ThemeMode = 'light' | 'dark'

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface AuthUser {
  id: number
  username: string
  email?: string
  full_name?: string
  role?: string
  company_id?: number
}

export interface ShipmentDetail {
  id: number
  tracking_number?: string
  sender_name: string
  receiver_name: string
  receiver_phone: string
  address: string
  city: string
  status: string
  notes?: string
  cod_amount?: number
  estimated_delivery_days?: number
  created_at?: string
  updated_at?: string
}

export interface ShipmentDashboardStats {
  total_shipments: number
  pending: number
  in_transit: number
  delivered: number
  cancelled: number
}

export interface ShipmentHistoryItem {
  id: number
  shipment_id?: number
  old_status: string
  new_status: string
  changed_by?: number
  changed_at: string
}

export interface ProofOfDeliveryRequestPayload {
  recipientName: string
  relation: string
  notes: string
  photos: string[]
  signatureData: string
}

export interface CodCollectionRequestPayload {
  amountDue: number
  cashTendered: number
  changeDue: number
}

export interface OfflineOperation {
  id: string
  type: 'proof_of_delivery' | 'cod_collection' | 'shipment_status'
  payload: Record<string, unknown>
  createdAt: string
}

export interface AppSettings {
  theme: ThemeMode
  offlineMode: boolean
}
