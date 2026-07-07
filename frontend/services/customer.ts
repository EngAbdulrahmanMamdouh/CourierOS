import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'

type CustomerPayload = {
  full_name: string
  phone: string
  email?: string
  address: string
  city: string
  company_name?: string
  notes?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = (payload as { detail?: string } | null)?.detail || 'Customer request failed.'
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

export async function fetchCustomers(page = 1, size = 50, search?: string) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)
  const response = await fetch(`${API_BASE}/customers?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<any[]>(response)
}

export async function fetchCustomerById(id: number) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<CustomerPayload & { id: number }>(response)
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await fetch(`${API_BASE}/customers/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export async function updateCustomer(id: number, payload: CustomerPayload) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export async function deleteCustomer(id: number) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse(response)
}

export type { CustomerPayload }
