import { useEffect, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { locationTrackingService } from '../services/locationTracking'

export function useLocationTracking(shipmentId?: number) {
  const { token, user } = useAuth()
  const appStateRef = useRef(AppState.currentState)
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTracking = useCallback(async () => {
    if (!token || user?.role !== 'employee') {
      return
    }

    try {
      const started = await locationTrackingService.startTracking(shipmentId)
      if (started) {
        // Also send updates via foreground interval for reliability
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current)
        }

        trackingIntervalRef.current = setInterval(async () => {
          const location = await locationTrackingService.getCurrentLocation()
          if (location) {
            await locationTrackingService.submitLocation({
              ...location,
              shipment_id: shipmentId,
            })
          }
        }, 10000)
      }
    } catch (error) {
      console.error('Failed to start tracking:', error)
    }
  }, [token, user, shipmentId])

  const stopTracking = useCallback(async () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }
    await locationTrackingService.stopTracking()
  }, [])

  useEffect(() => {
    // Start tracking when user is authenticated as an employee
    if (token && user?.role === 'employee') {
      startTracking()
    } else {
      stopTracking()
    }

    return () => {
      stopTracking()
    }
  }, [token, user, startTracking, stopTracking])

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const prevAppState = appStateRef.current
      appStateRef.current = nextAppState

      if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        if (token && user?.role === 'employee') {
          await startTracking()
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to background
        // Tracking continues in background with TaskManager
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [token, user, startTracking])

  return {
    isTracking: locationTrackingService.isCurrentlyTracking(),
    startTracking,
    stopTracking,
  }
}
