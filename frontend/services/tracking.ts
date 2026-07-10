import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload as { detail?: string } | null)?.detail || 'Tracking request failed.'
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

export async function fetchActiveCouriers(): Promise<ActiveCourier[]> {
  const response = await fetch(`${API_BASE}/tracking/live`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  const payload = await handleResponse<ActiveCourier[]>(response)
  return Array.isArray(payload) ? payload : []
}

export async function fetchCourierHistory(
  courierId: number,
  hours: number = 24,
  limit: number = 500,
): Promise<CourierLocationHistory[]> {
  const response = await fetch(
    `${API_BASE}/tracking/history/${courierId}?hours=${hours}&limit=${limit}`,
    {
      method: 'GET',
      headers: buildHeaders(),
      cache: 'no-store',
    },
  )

  const payload = await handleResponse<CourierLocationHistory[]>(response)
  return Array.isArray(payload) ? payload : []
}

export async function getCourierLocation(courierId: number) {
  const response = await fetch(`${API_BASE}/tracking/courier/${courierId}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse(response)
}
