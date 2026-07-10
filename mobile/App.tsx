import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppNavigator } from './src/navigation/AppNavigator'
import { AuthProvider } from './src/context/AuthContext'
import { registerNotificationHandlers } from './src/services/notifications'
import { useOfflineSync } from './src/hooks/useOfflineSync'
import { useLocationTracking } from './src/hooks/useLocationTracking'

const queryClient = new QueryClient()

function OfflineSyncController() {
  useOfflineSync()
  return null
}

function LocationTrackingController() {
  useLocationTracking()
  return null
}

export default function App() {
  useEffect(() => {
    registerNotificationHandlers()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineSyncController />
        <LocationTrackingController />
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  )
}

