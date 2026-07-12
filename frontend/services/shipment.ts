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

export async function updateShipmentStatus(shipmentId: number, status: ShipmentStatus): Promise<{ message: string; shipment_id: number; old_status: string; new_status: string }> {
  const response = await fetch(`${API_BASE}/shipments/${shipmentId}/status`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify({ new_status: status }),
  })

  return handleResponse(response)
}

// Import/Export functions
export async function downloadShipmentTemplate(): Promise<Blob> {
  const response = await fetch(`${API_BASE}/imports/templates/shipments`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to download template')
  }

  return response.blob()
}

export async function previewShipmentImport(file: File): Promise<{
  detected_columns: string[]
  missing_required_columns: string[]
  preview_rows: Array<{
    row_number: number
    validation_status: 'valid' | 'invalid'
    validation_errors: string[]
    mapped_data: Record<string, any>
  }>
  total_rows: number
}> {
  const formData = new FormData()
  formData.append('file', file)

  const token = getAccessToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in again.')
  }

  const response = await fetch(`${API_BASE}/imports/shipments/preview`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  return handleResponse(response)
}

export async function executeShipmentImport(file: File): Promise<{
  total_rows: number
  successful_rows: number
  failed_rows: number
  duplicate_rows: number
  validation_errors: Array<{
    row_number: number
    errors: string[]
    mapped_data: Record<string, any>
  }>
  created_shipment_ids: number[]
  execution_time: number
  import_job_id: number
}> {
  const formData = new FormData()
  formData.append('file', file)

  const token = getAccessToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in again.')
  }

  const response = await fetch(`${API_BASE}/imports/shipments/execute`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  return handleResponse(response)
}

export async function downloadErrorReport(jobId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE}/imports/${jobId}/error-report`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to download error report')
  }

  return response.blob()
}

export async function getImportJobs(page: number = 1, size: number = 10): Promise<Array<{
  id: number
  file_name: string
  status: string
  total_rows: number
  imported_rows: number
  failed_rows: number
  duplicate_rows?: number
  uploaded_by: number
  uploaded_time: string
}>> {
  const response = await fetch(`${API_BASE}/imports/?page=${page}&size=${size}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  })

  return handleResponse(response)
}
