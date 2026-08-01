import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPayment, deletePayment, fetchPayments, updatePayment } from '@/services/payment'
import type { Payment, PaymentCreatePayload, PaymentUpdatePayload } from '@/types/payment'

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all] as const,
  detail: (id: number) => [...paymentKeys.all, id] as const,
}

export function usePaymentsQuery(page = 1, size = 10, search?: string) {
  return useQuery<Payment[]>({
    queryKey: [...paymentKeys.lists(), page, size, search ?? ''],
    queryFn: () => fetchPayments(page, size, search),
  })
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation<Payment, Error, PaymentCreatePayload>({
    mutationFn: (payload) => createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
    },
  })
}

export function useUpdatePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation<Payment, Error, { id: number; payload: PaymentUpdatePayload }>({
    mutationFn: ({ id, payload }) => updatePayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
    },
  })
}

export function useDeletePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
    },
  })
}
