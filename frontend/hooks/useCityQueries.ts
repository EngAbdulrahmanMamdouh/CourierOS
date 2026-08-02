import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCity, deleteCity, fetchCities, updateCity } from '@/services/city'
import type { City, CityCreatePayload, CityUpdatePayload } from '@/types/city'

export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all] as const,
  detail: (id: number) => [...cityKeys.all, id] as const,
}

export function useCitiesQuery(page = 1, size = 10, search?: string) {
  return useQuery<City[]>({
    queryKey: [...cityKeys.lists(), page, size, search ?? ''],
    queryFn: () => fetchCities(page, size, search),
  })
}

export function useCreateCityMutation() {
  const queryClient = useQueryClient()

  return useMutation<City, Error, CityCreatePayload>({
    mutationFn: (payload) => createCity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() })
    },
  })
}

export function useUpdateCityMutation() {
  const queryClient = useQueryClient()

  return useMutation<City, Error, { id: number; payload: CityUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateCity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() })
    },
  })
}

export function useDeleteCityMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() })
    },
  })
}
