import { useCallback, useEffect, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { checkNetworkConnectivity } from '../services/connectivity'
import { getQueuedOperationCount, syncQueuedOperations } from '../services/offlineQueue'
import { locationTrackingService } from '../services/locationTracking'

export function useOfflineSync(pollingInterval = 15000) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const refreshPendingCount = useCallback(async () => {
    const count = await getQueuedOperationCount()
    setPendingCount(count)
  }, [])

  const runSync = useCallback(async () => {
    const online = await checkNetworkConnectivity()
    setIsOnline(online)

    if (!online) {
      await refreshPendingCount()
      return
    }

    const [syncedOperations, syncedLocations] = await Promise.all([
      syncQueuedOperations(),
      locationTrackingService.syncQueuedLocations(),
    ])

    if (syncedOperations + syncedLocations > 0) {
      queryClient.invalidateQueries({ queryKey: ['assignedShipments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['shipmentDetail'] })
      setLastSyncedAt(new Date().toISOString())
    }

    await refreshPendingCount()
  }, [queryClient, refreshPendingCount])

  useEffect(() => {
    runSync()
    const interval = setInterval(runSync, pollingInterval)
    return () => clearInterval(interval)
  }, [pollingInterval, runSync])

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        await runSync()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [runSync])

  return { isOnline, pendingCount, lastSyncedAt }
}
