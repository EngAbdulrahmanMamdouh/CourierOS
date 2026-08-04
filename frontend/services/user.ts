import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'

export type User = {
  id: number
  username: string
  email: string
  role: string
  company_id: number | null
  full_name?: string | null
  phone?: string | null
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type UserCreatePayload = {
  username: string
  email: string
  password: string
  company_id?: number | null
  role?: string
  full_name?: string | null
  phone?: string | null
  is_active?: boolean
}

export type UserUpdatePayload = {
  full_name?: string | null
  phone?: string | null
  email?: string
}

export type UserRoleUpdatePayload = {
  role: string
}

export type UserStatusUpdatePayload = {
  is_active: boolean
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = (payload as { detail?: string } | null)?.detail || 'User request failed.'
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

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...(init.headers || {}),
    },
  })

  return handleResponse<T>(response)
}

export async function getUsers(): Promise<User[]> {
  return requestJson<User[]>('/users/all')
}

export async function getUser(id: number): Promise<User> {
  return requestJson<User>(`/users/${id}`)
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  return requestJson<User>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUser(id: number, payload: UserUpdatePayload): Promise<User> {
  return requestJson<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(id: number): Promise<void> {
  await requestJson<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}

export async function changeRole(id: number, payload: UserRoleUpdatePayload): Promise<User> {
  return requestJson<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function changeStatus(id: number, payload: UserStatusUpdatePayload): Promise<User> {
  return requestJson<User>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
