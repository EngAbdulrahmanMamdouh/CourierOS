export type FinanceSummary = {
  total_cod_due: number
  total_cod_collected: number
  total_cod_pending: number
  total_payments_received: number
  outstanding_balance: number
}

export type FinanceLedgerShipment = {
  id: number
  tracking_number: string | null
  cod_amount: number
  status: string
  created_at: string | null
  delivered_at: string | null
}

export type FinanceLedgerPayment = {
  id: number
  shipment_id: number | null
  cod_id: number | null
  amount: number
  currency: string
  payment_method: string
  payment_status: string
  transaction_reference: string
  paid_at: string | null
  created_at: string | null
  notes: string | null
}

export type FinanceCustomerLedger = {
  customer_id: number
  customer_name: string | null
  total_cod_due: number
  total_payments: number
  outstanding_balance: number
  shipments: FinanceLedgerShipment[]
  payments: FinanceLedgerPayment[]
}

export type FinanceSettlementItem = {
  shipment_id: number
  cod_amount: number
  collected: boolean
  collected_at: string | null
  customer_name: string | null
}

export type FinanceCourierSettlement = {
  driver_id: number
  driver_name: string | null
  total_collected: number
  total_pending: number
  settlements: FinanceSettlementItem[]
}

export type FinanceHistoryItem = {
  id: number
  type: 'payment' | 'cod'
  amount: number
  reference: string
  created_at: string | null
  notes: string | null
}

export type FinanceHistoryResponse = {
  items: FinanceHistoryItem[]
}

export type FinanceReportResponse = {
  summary: FinanceSummary
  history: FinanceHistoryResponse
  generated_at: string
}
