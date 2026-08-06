import { API_BASE } from '@/config'

export const ACCESS_TOKEN_STORAGE_KEY = 'courieros.access_token'
export const LOCAL_DEV_MOCK_AUTH_STORAGE_KEY = 'courieros.dev_mock_auth'
export const LOCAL_DEV_ROLE_STORAGE_KEY = 'courieros.dev_mock_role'
export const LOCAL_DEV_USERNAME_STORAGE_KEY = 'courieros.dev_mock_username'
export const LOCAL_DEV_COMPANY_ID_STORAGE_KEY = 'courieros.dev_mock_company_id'

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
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  } catch {
    // Ignore storage errors
  }
}

function buildMockAccessToken(role = 'super_admin', username = 'local-dev-admin', companyId = 1): string {
  const payload = {
    sub: username,
    username,
    role,
    company_id: companyId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }

  return `mock.${btoa(JSON.stringify(payload))}.dev`
}

export function isLocalDevAuthEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const query = new URLSearchParams(window.location.search)
    if (query.get('mockAuth') === '1' || query.get('mockAuth') === 'true') {
      return true
    }

    const storageValue = localStorage.getItem(LOCAL_DEV_MOCK_AUTH_STORAGE_KEY)
    if (storageValue === 'true') {
      return true
    }

    return process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'
  } catch {
    return false
  }
}

export function setLocalDevAuth(enabled: boolean, role = 'super_admin', username = 'local-dev-admin', companyId = 1): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(LOCAL_DEV_MOCK_AUTH_STORAGE_KEY, enabled ? 'true' : 'false')
    localStorage.setItem(LOCAL_DEV_ROLE_STORAGE_KEY, role)
    localStorage.setItem(LOCAL_DEV_USERNAME_STORAGE_KEY, username)
    localStorage.setItem(LOCAL_DEV_COMPANY_ID_STORAGE_KEY, String(companyId))

    if (enabled) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, buildMockAccessToken(role, username, companyId))
    } else {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    if (storedToken) {
      return storedToken
    }

    if (isLocalDevAuthEnabled()) {
      const role = localStorage.getItem(LOCAL_DEV_ROLE_STORAGE_KEY) || 'super_admin'
      const username = localStorage.getItem(LOCAL_DEV_USERNAME_STORAGE_KEY) || 'local-dev-admin'
      const companyId = Number(localStorage.getItem(LOCAL_DEV_COMPANY_ID_STORAGE_KEY) || '1')
      const mockToken = buildMockAccessToken(role, username, companyId)
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, mockToken)
      return mockToken
    }

    return null
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