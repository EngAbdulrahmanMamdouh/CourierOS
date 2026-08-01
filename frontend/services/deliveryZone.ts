import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { DeliveryZone, DeliveryZoneCreatePayload } from '@/types/deliveryZone'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Delivery zone request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchDeliveryZones(page = 1, size = 10, search?: string): Promise<DeliveryZone[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/delivery-zones/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<DeliveryZone[]>(response)
}

export async function fetchDeliveryZoneById(id: number): Promise<DeliveryZone> {
  const response = await fetch(`${API_BASE}/delivery-zones/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<DeliveryZone>(response)
}

export async function createDeliveryZone(payload: DeliveryZoneCreatePayload): Promise<DeliveryZone> {
  const response = await fetch(`${API_BASE}/delivery-zones/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<DeliveryZone>(response)
}

export async function updateDeliveryZone(id: number, payload: DeliveryZoneCreatePayload): Promise<DeliveryZone> {
  const response = await fetch(`${API_BASE}/delivery-zones/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<DeliveryZone>(response)
}

export async function deleteDeliveryZone(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/delivery-zones/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
