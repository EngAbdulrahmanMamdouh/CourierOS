import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { CodCollectionResponse, FinanceCourierSettlement, FinanceCustomerLedger, FinanceHistoryResponse, FinanceReportResponse, FinanceSummary } from '@/types/finance'

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (payload as { detail?: string } | null)?.detail || 'Finance request failed.'
    throw new Error(message)
  }
  return payload as T
}

function buildHeaders(): HeadersInit {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in again.')
  }
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function fetchFinanceSummary(): Promise<FinanceSummary> {
  const response = await fetch(`${API_BASE}/finance/summary`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse<FinanceSummary>(response)
}

export async function fetchCustomerLedger(customerId: number): Promise<FinanceCustomerLedger> {
  const response = await fetch(`${API_BASE}/finance/customers/${customerId}/ledger`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse<FinanceCustomerLedger>(response)
}

export async function fetchCourierSettlement(driverId: number): Promise<FinanceCourierSettlement> {
  const response = await fetch(`${API_BASE}/finance/drivers/${driverId}/settlement`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse<FinanceCourierSettlement>(response)
}

export async function fetchFinanceHistory(): Promise<FinanceHistoryResponse> {
  const response = await fetch(`${API_BASE}/finance/history`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse<FinanceHistoryResponse>(response)
}

export async function fetchFinanceReports(): Promise<FinanceReportResponse> {
  const response = await fetch(`${API_BASE}/finance/reports`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse<FinanceReportResponse>(response)
}

export async function collectCod(shipmentId: number, payload: { amount_due: number; cash_tendered: number; change_due: number; transaction_reference?: string; notes?: string }): Promise<CodCollectionResponse> {
  const response = await fetch(`${API_BASE}/finance/shipments/${shipmentId}/collect`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<CodCollectionResponse>(response)
}
