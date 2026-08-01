import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDeliveryZone, deleteDeliveryZone, fetchDeliveryZones, updateDeliveryZone } from '@/services/deliveryZone'
import type { DeliveryZone, DeliveryZoneCreatePayload, DeliveryZoneUpdatePayload } from '@/types/deliveryZone'

export const deliveryZoneKeys = {
  all: ['delivery-zones'] as const,
  lists: () => [...deliveryZoneKeys.all] as const,
  detail: (id: number) => [...deliveryZoneKeys.all, id] as const,
}

export function useDeliveryZonesQuery(page = 1, size = 10, search?: string) {
  return useQuery<DeliveryZone[]>({
    queryKey: [...deliveryZoneKeys.lists(), page, size, search ?? ''],
    queryFn: () => fetchDeliveryZones(page, size, search),
  })
}

export function useCreateDeliveryZoneMutation() {
  const queryClient = useQueryClient()

  return useMutation<DeliveryZone, Error, DeliveryZoneCreatePayload>({
    mutationFn: (payload) => createDeliveryZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.lists() })
    },
  })
}

export function useUpdateDeliveryZoneMutation() {
  const queryClient = useQueryClient()

  return useMutation<DeliveryZone, Error, { id: number; payload: DeliveryZoneUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateDeliveryZone(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.lists() })
    },
  })
}

export function useDeleteDeliveryZoneMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deleteDeliveryZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.lists() })
    },
  })
}
