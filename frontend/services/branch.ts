import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { Branch, BranchCreatePayload } from '@/types/branch'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Branch request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchBranches(page = 1, size = 50, search?: string) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)
  const response = await fetch(`${API_BASE}/branches/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return handleResponse<Branch[]>(response)
}

export async function fetchBranchById(id: number) {
  const response = await fetch(`${API_BASE}/branches/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return handleResponse<Branch>(response)
}

export async function createBranch(payload: BranchCreatePayload) {
  const response = await fetch(`${API_BASE}/branches/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<Branch>(response)
}

export async function updateBranch(id: number, payload: BranchCreatePayload) {
  const response = await fetch(`${API_BASE}/branches/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<Branch>(response)
}

export async function deleteBranch(id: number) {
  const response = await fetch(`${API_BASE}/branches/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  return handleResponse<{ message: string }>(response)
}
