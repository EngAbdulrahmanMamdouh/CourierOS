import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CustomerNavigator } from './src/navigation/CustomerNavigator'
import { hydrateCustomerAuth } from './src/store/auth'

const queryClient = new QueryClient()

export default function App() {
  useEffect(() => {
    hydrateCustomerAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <CustomerNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  )
}
