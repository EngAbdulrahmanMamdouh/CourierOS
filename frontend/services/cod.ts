import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { Cod, CodCreatePayload, CodUpdatePayload } from '@/types/cod'

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
    const message = (payload as { detail?: string } | null)?.detail || 'COD request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchCods(page = 1, size = 50, search?: string): Promise<Cod[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/cods/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Cod[]>(response)
}

export async function fetchCodById(id: number): Promise<Cod> {
  const response = await fetch(`${API_BASE}/cods/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Cod>(response)
}

export async function createCod(payload: CodCreatePayload): Promise<Cod> {
  const response = await fetch(`${API_BASE}/cods/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Cod>(response)
}

export async function updateCod(id: number, payload: CodUpdatePayload): Promise<Cod> {
  const response = await fetch(`${API_BASE}/cods/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Cod>(response)
}

export async function deleteCod(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/cods/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
