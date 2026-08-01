import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { CompanySettings, CompanySettingsPayload } from '@/types/companySettings'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Company settings request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchCompanySettings(companyId: number): Promise<CompanySettings> {
  const response = await fetch(`${API_BASE}/company-settings/${companyId}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<CompanySettings>(response)
}

export async function createCompanySettings(payload: CompanySettingsPayload): Promise<CompanySettings> {
  const response = await fetch(`${API_BASE}/company-settings/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<CompanySettings>(response)
}

export async function updateCompanySettings(companyId: number, payload: CompanySettingsPayload): Promise<CompanySettings> {
  const response = await fetch(`${API_BASE}/company-settings/${companyId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<CompanySettings>(response)
}
