import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { City, CityCreatePayload } from '@/types/city'

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
    const message = (payload as { detail?: string } | null)?.detail || 'City request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchCities(page = 1, size = 10, search?: string): Promise<City[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/cities/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<City[]>(response)
}

export async function fetchCityById(id: number): Promise<City> {
  const response = await fetch(`${API_BASE}/cities/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<City>(response)
}

export async function createCity(payload: CityCreatePayload): Promise<City> {
  const response = await fetch(`${API_BASE}/cities/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<City>(response)
}

export async function updateCity(id: number, payload: CityCreatePayload): Promise<City> {
  const response = await fetch(`${API_BASE}/cities/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<City>(response)
}

export async function deleteCity(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/cities/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
