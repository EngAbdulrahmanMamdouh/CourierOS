import { API_BASE } from '@/config'
import { getAccessToken } from '@/services/auth'
import type { ShipmentCreatePayload, ShipmentListItem, ShipmentResponse } from '@/types/shipment'
import type { ShipmentStatus } from '@/constants/shipment'

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload as { detail?: string } | null)?.detail || 'Shipment request failed.'
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

export async function fetchShipments(): Promise<ShipmentListItem[]> {
  const response = await fetch(`${API_BASE}/shipments/`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  const payload = await handleResponse<ShipmentListItem[]>(response)
  return Array.isArray(payload) ? payload : []
}

export async function createShipment(payload: ShipmentCreatePayload): Promise<ShipmentResponse> {
  const response = await fetch(`${API_BASE}/shipments/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  const result = await handleResponse<{ data: ShipmentResponse }>(response)
  return result.data
}

export async function fetchShipmentById(shipmentId: number): Promise<ShipmentResponse> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse<ShipmentResponse>(response)
}

export async function updateShipment(shipmentId: number, payload: ShipmentCreatePayload): Promise<ShipmentResponse> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<ShipmentResponse>(response)
}

export async function deleteShipment(shipmentId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  return handleResponse<{ message: string }>(response)
}

export async function updateShipment(shipmentId: number, payload: ShipmentCreatePayload): Promise<ShipmentResponse> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse<ShipmentResponse>(response)
}

export async function updateShipmentStatus(shipmentId: number, status: ShipmentStatus): Promise<{ message: string; shipment_id: number; old_status: string; new_status: string }> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}/status`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify({ new_status: status }),
  })

  return handleResponse(response)
}
