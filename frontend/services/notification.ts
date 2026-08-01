import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { Notification } from '@/types/notification'

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = (payload as { detail?: string } | null)?.detail || 'Notification request failed.'
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

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch(`${API_BASE}/notifications/`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<Notification[]>(response)
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: buildHeaders(),
  })

  return handleResponse<Notification>(response)
}

export async function markAllNotificationsRead(): Promise<{ message: string; count: number }> {
  const response = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string; count: number }>(response)
}
