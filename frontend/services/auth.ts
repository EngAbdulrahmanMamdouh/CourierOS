import { API_BASE } from '@/config'

export const ACCESS_TOKEN_STORAGE_KEY = 'courieros.access_token'

export type LoginCredentials = {
  username: string
  password: string
}

export type AuthToken = {
  access_token: string
  token_type: 'bearer'
}

function saveAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // تنظيف أي توكن قديم
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)

    // حفظ التوكن الجديد
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  } catch {
    // Ignore storage errors
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}

export function getAuthenticatedCompanyId(): number | null {
  const token = getAccessToken()

  if (!token) {
    return null
  }

  try {
    const parts = token.split('.')

    if (parts.length < 2) {
      return null
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalizedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')
    const decoded = window.atob(normalizedPayload)
    const parsed = JSON.parse(decoded) as { company_id?: number }

    return typeof parsed.company_id === 'number' ? parsed.company_id : null
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

export function logout(): void {
  clearSession()
}

export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
  })

  let response: Response

  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    })
  } catch {
    throw new Error(
      'Unable to reach CourierOS. Please check your network connection and try again.'
    )
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    throw new Error(
      errorBody?.detail ||
      errorBody?.message ||
      'Unable to sign in. Please check your credentials.'
    )
  }

  const data = (await response.json()) as AuthToken

  saveAccessToken(data.access_token)

  return data
}