"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import TrackingPageClient from './TrackingPageClient'

export default function TrackingQueryProvider() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingPageClient />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
