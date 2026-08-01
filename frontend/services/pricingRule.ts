import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { PricingRule, PricingRuleCreatePayload } from '@/types/pricingRule'

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
    const message = (payload as { detail?: string } | null)?.detail || 'Pricing rule request failed.'
    throw new Error(message)
  }

  return payload as T
}

export async function fetchPricingRules(page = 1, size = 100, search?: string): Promise<PricingRule[]> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.append('search', search)

  const response = await fetch(`${API_BASE}/pricing-rules/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<PricingRule[]>(response)
}

export async function createPricingRule(payload: PricingRuleCreatePayload): Promise<PricingRule> {
  const response = await fetch(`${API_BASE}/pricing-rules/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<PricingRule>(response)
}

export async function updatePricingRule(id: number, payload: PricingRuleCreatePayload): Promise<PricingRule> {
  const response = await fetch(`${API_BASE}/pricing-rules/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<PricingRule>(response)
}

export async function deletePricingRule(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/pricing-rules/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}
