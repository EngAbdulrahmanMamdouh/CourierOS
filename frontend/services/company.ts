import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { Company, CompanyCreatePayload, CompanyUpdatePayload } from '@/types/company'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Company request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchCompanies(page = 1, size = 50): Promise<Company[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await fetch(`${API_BASE}/companies/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Company[]>(response)
}

export async function fetchCompanyById(id: number): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return handleResponse<Company>(response)
}

export async function createCompany(payload: CompanyCreatePayload): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Company>(response)
}

export async function updateCompany(id: number, payload: CompanyUpdatePayload): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<Company>(response)
}

export async function deleteCompany(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
