import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPickupRequest, deletePickupRequest, fetchPickupRequests, updatePickupRequest } from '@/services/pickupRequest'
import type { PickupRequest, PickupRequestCreatePayload, PickupRequestUpdatePayload } from '@/types/pickupRequest'

export const pickupRequestKeys = {
  all: ['pickup-requests'] as const,
  lists: () => [...pickupRequestKeys.all] as const,
  detail: (id: number) => [...pickupRequestKeys.all, id] as const,
}

export function usePickupRequestsQuery(page = 1, size = 10, search?: string) {
  return useQuery<PickupRequest[]>({
    queryKey: [...pickupRequestKeys.lists(), page, size, search ?? ''],
    queryFn: () => fetchPickupRequests(page, size, search),
  })
}

export function useCreatePickupRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation<PickupRequest, Error, PickupRequestCreatePayload>({
    mutationFn: (payload) => createPickupRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupRequestKeys.lists() })
    },
  })
}

export function useUpdatePickupRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation<PickupRequest, Error, { id: number; payload: PickupRequestUpdatePayload }>({
    mutationFn: ({ id, payload }) => updatePickupRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupRequestKeys.lists() })
    },
  })
}

export function useDeletePickupRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deletePickupRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupRequestKeys.lists() })
    },
  })
}
