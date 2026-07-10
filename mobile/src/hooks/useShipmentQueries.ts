import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssignedShipments, getDashboardStats, getShipmentDetails, getShipmentHistory, updateShipmentStatus, submitProofOfDelivery } from '../services/shipment'
import { ShipmentDetail, ShipmentHistoryItem } from '../types'

interface AssignedShipmentsParams {
  status?: string
  search?: string
  pageSize?: number
}

export function useDashboardStatsQuery() {
  return useQuery(['dashboardStats'], getDashboardStats, {
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useAssignedShipmentsQuery({ status, search, pageSize = 20 }: AssignedShipmentsParams) {
  return useInfiniteQuery(
    ['assignedShipments', { status, search }],
    ({ pageParam = 1 }) => getAssignedShipments(pageParam, pageSize, status, search),
    {
      getNextPageParam: (lastPage, pages) => (lastPage.length === pageSize ? pages.length + 1 : undefined),
      staleTime: 1000 * 60,
      retry: 1,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )
}

export function useShipmentDetailsQuery(shipmentId?: number, initialData?: ShipmentDetail) {
  return useQuery(['shipmentDetail', shipmentId], () => getShipmentDetails(shipmentId!), {
    enabled: typeof shipmentId === 'number' && !Number.isNaN(shipmentId),
    initialData,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useShipmentHistoryQuery(shipmentId?: number) {
  return useQuery<ShipmentHistoryItem[]>(['shipmentHistory', shipmentId], () => getShipmentHistory(shipmentId!), {
    enabled: typeof shipmentId === 'number' && !Number.isNaN(shipmentId),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateShipmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    ({ shipmentId, status }: { shipmentId: number; status: string }) => updateShipmentStatus(shipmentId, status),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(['shipmentDetail', variables.shipmentId], data)
        queryClient.invalidateQueries(['shipmentHistory', variables.shipmentId])
        queryClient.invalidateQueries(['assignedShipments'])
        queryClient.invalidateQueries(['dashboardStats'])
      },
    },
  )
}

export function useSubmitProofOfDeliveryMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    ({ shipmentId, payload }: { shipmentId: number; payload: any }) => submitProofOfDelivery(shipmentId, payload),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(['shipmentDetail', variables.shipmentId], data)
        queryClient.invalidateQueries(['assignedShipments'])
        queryClient.invalidateQueries(['dashboardStats'])
      },
    },
  )
}
