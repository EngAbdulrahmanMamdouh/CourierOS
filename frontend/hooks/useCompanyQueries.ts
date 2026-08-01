import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCompany, deleteCompany, fetchCompanies, updateCompany } from '@/services/company'
import type { Company, CompanyCreatePayload, CompanyUpdatePayload } from '@/types/company'

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all] as const,
  detail: (id: number) => [...companyKeys.all, id] as const,
}

export function useCompaniesQuery(page = 1, size = 10) {
  return useQuery<Company[]>({
    queryKey: [...companyKeys.lists(), page, size],
    queryFn: () => fetchCompanies(page, size),
  })
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<Company, Error, CompanyCreatePayload>({
    mutationFn: (payload) => createCompany(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<Company, Error, { id: number; payload: CompanyUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}
