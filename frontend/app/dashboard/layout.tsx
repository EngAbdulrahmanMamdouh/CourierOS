import { ReactNode } from 'react'
import RouteGuard from '@/components/dashboard/RouteGuard'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>
}
