"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import DriverPageClient from './DriverPageClient'

export default function DriverQueryProvider() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <DriverPageClient />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
