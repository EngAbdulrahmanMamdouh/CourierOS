export type Payment = {
  id: number
  shipment_id: number | null
  cod_id: number | null
  customer_id: number
  company_id: number | null
  amount: number
  currency: string
  payment_method: string
  payment_status: string
  transaction_reference: string
  paid_at: string | null
  notes: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentCreatePayload = {
  shipment_id?: number | null
  cod_id?: number | null
  customer_id: number
  amount: number
  currency?: string
  payment_method: string
  payment_status: string
  transaction_reference: string
  paid_at?: string | null
  notes?: string | null
}

export type PaymentUpdatePayload = PaymentCreatePayload
