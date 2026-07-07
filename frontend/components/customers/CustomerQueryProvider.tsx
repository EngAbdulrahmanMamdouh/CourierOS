"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import CustomerPageClient from './CustomerPageClient'

export default function CustomerQueryProvider() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerPageClient />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
