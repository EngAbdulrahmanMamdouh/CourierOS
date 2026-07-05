import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CustomerNavigator } from './src/navigation/CustomerNavigator'
import { useAuthStore } from './src/store/auth'
import { getToken } from './src/utils/storage'

const queryClient = new QueryClient()

export default function App() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getToken()
        if (token) {
          setAuth({ id: 0, username: 'customer', role: 'customer' }, token)
        }
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [setAuth, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <CustomerNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  )
}
