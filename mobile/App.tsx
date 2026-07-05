import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppNavigator } from './src/navigation/AppNavigator'
import { useAuthStore } from './src/store/auth'
import { getToken } from './src/utils/storage'
import { registerNotificationHandlers } from './src/services/notifications'

const queryClient = new QueryClient()

export default function App() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getToken()
        if (token) {
          setAuth({ id: 1, username: 'driver', role: 'driver' }, token)
        }
        await registerNotificationHandlers()
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [setAuth, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  )
}
