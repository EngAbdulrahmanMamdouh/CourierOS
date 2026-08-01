import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { PickupRequest, PickupRequestCreatePayload, PickupRequestUpdatePayload } from '@/types/pickupRequest'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Pickup request request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchPickupRequests(page = 1, size = 50, search?: string): Promise<PickupRequest[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/pickup-requests/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<PickupRequest[]>(response)
}

export async function fetchPickupRequestById(id: number): Promise<PickupRequest> {
  const response = await fetch(`${API_BASE}/pickup-requests/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<PickupRequest>(response)
}

export async function createPickupRequest(payload: PickupRequestCreatePayload): Promise<PickupRequest> {
  const response = await fetch(`${API_BASE}/pickup-requests/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<PickupRequest>(response)
}

export async function updatePickupRequest(id: number, payload: PickupRequestUpdatePayload): Promise<PickupRequest> {
  const response = await fetch(`${API_BASE}/pickup-requests/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<PickupRequest>(response)
}

export async function deletePickupRequest(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/pickup-requests/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
