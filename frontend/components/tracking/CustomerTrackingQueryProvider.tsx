"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TrackingCustomerClient from './TrackingCustomerClient'

export default function CustomerTrackingQueryProvider() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingCustomerClient />
    </QueryClientProvider>
  )
}
