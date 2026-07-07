import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { DriverCreatePayload, DriverListItem, DriverResponse } from '@/types/driver'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Driver request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchDrivers(page = 1, size = 50, search?: string) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/drivers?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<DriverListItem[]>(response)
}

export async function fetchDriverById(id: number) {
  const response = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<DriverResponse>(response)
}

export async function createDriver(payload: DriverCreatePayload) {
  const bodyPayload = { ...payload } as any
  if (bodyPayload.license_expiry === '') delete bodyPayload.license_expiry

  const response = await fetch(`${API_BASE}/drivers/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(bodyPayload),
  })

  return handleResponse<DriverResponse>(response)
}

export async function updateDriver(id: number, payload: DriverCreatePayload) {
  const bodyPayload = { ...payload } as any
  if (bodyPayload.license_expiry === '') delete bodyPayload.license_expiry

  const response = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(bodyPayload),
  })

  return handleResponse<DriverResponse>(response)
}

function normalizeDriverId(id: number | string | null | undefined): number {
  const parsed = typeof id === 'number' ? id : Number(id)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Invalid driver selection.')
  }

  return parsed
}

export async function deleteDriver(id: number | string | null | undefined) {
  const driverId = normalizeDriverId(id)
  const response = await fetch(`${API_BASE}/drivers/${driverId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
