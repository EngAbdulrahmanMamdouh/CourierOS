"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import ShipmentPageClient from '@/components/shipments/ShipmentPageClient'

export default function ShipmentQueryProvider() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ShipmentPageClient />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
