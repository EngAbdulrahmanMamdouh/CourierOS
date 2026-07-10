import api from './api'
import { ShipmentDetail, ShipmentDashboardStats, ShipmentHistoryItem } from '../types'

export async function getAssignedShipments(
  page: number = 1,
  size: number = 20,
  status?: string,
  search?: string,
): Promise<ShipmentDetail[]> {
  const response = await api.get<ShipmentDetail[]>('/shipments', {
    params: {
      page,
      size,
      status,
      search,
    },
  })

  return response.data
}

export async function getDashboardStats(): Promise<ShipmentDashboardStats> {
  const response = await api.get<ShipmentDashboardStats>('/shipments/dashboard')
  return response.data
}

export async function getShipmentDetails(shipmentId: number | string): Promise<ShipmentDetail> {
  const response = await api.get<ShipmentDetail>(`/shipments/${shipmentId}`)
  return response.data
}

export async function getShipmentHistory(shipmentId: number | string): Promise<ShipmentHistoryItem[]> {
  const response = await api.get<ShipmentHistoryItem[]>(`/shipments/${shipmentId}/history`)
  return response.data
}

export async function updateShipmentStatus(shipmentId: number | string, newStatus: string): Promise<ShipmentDetail> {
  const response = await api.patch<ShipmentDetail>(`/shipments/${shipmentId}/status`, {
    new_status: newStatus,
  })
  return response.data
}

export async function submitProofOfDelivery(
  shipmentId: number | string,
  payload: {
    recipientName: string
    relation: string
    notes: string
    photos: string[]
    signatureData: string
  },
): Promise<ShipmentDetail> {
  const response = await api.post<ShipmentDetail>(`/shipments/${shipmentId}/proof-of-delivery`, {
    recipient_name: payload.recipientName,
    relation: payload.relation,
    notes: payload.notes,
    photos: payload.photos,
    signature_data: payload.signatureData,
  })
  return response.data
}

export async function submitCodCollection(
  shipmentId: number | string,
  payload: {
    amountDue: number
    cashTendered: number
    changeDue: number
  },
): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>(`/shipments/${shipmentId}/cod-collection`, {
    amount_due: payload.amountDue,
    cash_tendered: payload.cashTendered,
    change_due: payload.changeDue,
  })
  return response.data
}

export default {
  getAssignedShipments,
  getDashboardStats,
  getShipmentDetails,
  getShipmentHistory,
  updateShipmentStatus,
  submitProofOfDelivery,
  submitCodCollection,
}
