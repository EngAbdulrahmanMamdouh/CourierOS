import { useQuery } from '@tanstack/react-query'
import { fetchCustomerLedger, fetchCourierSettlement, fetchFinanceHistory, fetchFinanceReports, fetchFinanceSummary } from '@/services/finance'

export function useFinanceSummary() {
  return useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: fetchFinanceSummary,
  })
}

export function useFinanceHistory() {
  return useQuery({
    queryKey: ['finance', 'history'],
    queryFn: fetchFinanceHistory,
  })
}

export function useFinanceReports() {
  return useQuery({
    queryKey: ['finance', 'reports'],
    queryFn: fetchFinanceReports,
  })
}

export function useCustomerLedger(customerId: number) {
  return useQuery({
    queryKey: ['finance', 'ledger', customerId],
    queryFn: () => fetchCustomerLedger(customerId),
    enabled: customerId > 0,
  })
}

export function useCourierSettlement(driverId: number) {
  return useQuery({
    queryKey: ['finance', 'settlement', driverId],
    queryFn: () => fetchCourierSettlement(driverId),
    enabled: driverId > 0,
  })
}
