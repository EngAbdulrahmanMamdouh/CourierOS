import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCod, deleteCod, fetchCods, updateCod } from '@/services/cod'
import type { Cod, CodCreatePayload, CodUpdatePayload } from '@/types/cod'

export const codKeys = {
  all: ['cods'] as const,
  lists: () => [...codKeys.all] as const,
  detail: (id: number) => [...codKeys.all, id] as const,
}

export function useCodsQuery(page = 1, size = 10, search?: string) {
  return useQuery<Cod[]>({
    queryKey: [...codKeys.lists(), page, size, search ?? ''],
    queryFn: () => fetchCods(page, size, search),
  })
}

export function useCreateCodMutation() {
  const queryClient = useQueryClient()

  return useMutation<Cod, Error, CodCreatePayload>({
    mutationFn: (payload) => createCod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: codKeys.lists() })
    },
  })
}

export function useUpdateCodMutation() {
  const queryClient = useQueryClient()

  return useMutation<Cod, Error, { id: number; payload: CodUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateCod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: codKeys.lists() })
    },
  })
}

export function useDeleteCodMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deleteCod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: codKeys.lists() })
    },
  })
}
