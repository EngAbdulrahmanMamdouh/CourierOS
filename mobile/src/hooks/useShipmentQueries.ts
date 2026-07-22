import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getAssignedShipments, getDashboardStats, getShipmentDetails, getShipmentHistory, getShipmentTracking, updateShipmentStatus, submitProofOfDelivery, type ShipmentTrackingResponse } from '../services/shipment'
import { ShipmentDetail, ShipmentHistoryItem, ShipmentDashboardStats } from '../types'

interface AssignedShipmentsParams {
  status?: string
  search?: string
  pageSize?: number
}

export function useDashboardStatsQuery() {
  return useQuery<ShipmentDashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useAssignedShipmentsQuery({ status, search, pageSize = 20 }: AssignedShipmentsParams) {
  return useInfiniteQuery<ShipmentDetail[], Error, InfiniteData<ShipmentDetail[]>, readonly [string, { status?: string | undefined; search?: string | undefined }], number>({
    queryKey: ['assignedShipments', { status, search }],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => getAssignedShipments(pageParam, pageSize, status, search),
    getNextPageParam: (lastPage, pages) => (lastPage.length === pageSize ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useShipmentDetailsQuery(shipmentId?: number, initialData?: ShipmentDetail) {
  return useQuery<ShipmentDetail, Error>({
    queryKey: ['shipmentDetail', shipmentId],
    queryFn: () => getShipmentDetails(shipmentId!),
    enabled: typeof shipmentId === 'number' && !Number.isNaN(shipmentId),
    initialData,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useShipmentHistoryQuery(shipmentId?: number) {
  return useQuery<ShipmentHistoryItem[], Error>({
    queryKey: ['shipmentHistory', shipmentId],
    queryFn: () => getShipmentHistory(shipmentId!),
    enabled: typeof shipmentId === 'number' && !Number.isNaN(shipmentId),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useShipmentTrackingQuery(shipmentId?: number) {
  return useQuery<ShipmentTrackingResponse, Error>({
    queryKey: ['shipmentTracking', shipmentId],
    queryFn: () => getShipmentTracking(shipmentId!),
    enabled: typeof shipmentId === 'number' && !Number.isNaN(shipmentId),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateShipmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation<ShipmentDetail, Error, { shipmentId: number; status: string }>({
    mutationFn: ({ shipmentId, status }) => updateShipmentStatus(shipmentId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['shipmentDetail', variables.shipmentId], data)
      queryClient.invalidateQueries({ queryKey: ['shipmentHistory', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['assignedShipments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export function useSubmitProofOfDeliveryMutation() {
  const queryClient = useQueryClient()

  return useMutation<ShipmentDetail, Error, { shipmentId: number; payload: any }>({
    mutationFn: ({ shipmentId, payload }) => submitProofOfDelivery(shipmentId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['shipmentDetail', variables.shipmentId], data)
      queryClient.invalidateQueries({ queryKey: ['assignedShipments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}
