import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { Payment, PaymentCreatePayload, PaymentUpdatePayload } from '@/types/payment'

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

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = (payload as { detail?: string } | null)?.detail || 'Payment request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchPayments(page = 1, size = 50, search?: string): Promise<Payment[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)
  const response = await fetch(`${API_BASE}/payments/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Payment[]>(response)
}

export async function fetchPaymentById(id: number): Promise<Payment> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Payment>(response)
}

export async function createPayment(payload: PaymentCreatePayload): Promise<Payment> {
  const response = await fetch(`${API_BASE}/payments/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Payment>(response)
}

export async function updatePayment(id: number, payload: PaymentUpdatePayload): Promise<Payment> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Payment>(response)
}

export async function deletePayment(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
