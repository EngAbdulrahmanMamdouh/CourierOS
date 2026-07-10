import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE } from '../config'
import { getToken } from '../utils/storage'

const LOCATION_TASK_NAME = 'background-location-tracking'
const LOCATION_QUEUE_KEY = 'location-queue'

interface LocationUpdate {
  latitude: number
  longitude: number
  speed: number
  heading: number
  accuracy: number | null
  battery_level: number | null
  shipment_id?: number | null
  timestamp?: number
}

class LocationTrackingService {
  private isTracking = false
  private shipmentId: number | null = null

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Failed to request location permission:', error)
      return false
    }
  }

  async requestBackgroundPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Failed to request background location permission:', error)
      return false
    }
  }

  async startTracking(shipmentId?: number): Promise<boolean> {
    try {
      const fgPermission = await this.requestPermission()
      if (!fgPermission) {
        console.error('Foreground location permission denied')
        return false
      }

      const bgPermission = await this.requestBackgroundPermission()
      if (!bgPermission) {
        console.warn('Background location permission denied; tracking will continue while app is active.')
      }

      this.shipmentId = shipmentId ?? null

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: 'CourierOS is tracking your location',
          notificationBody: 'Location updates are being sent to the server',
          notificationColor: '#38bdf8',
        },
      })

      this.isTracking = true
      return true
    } catch (error) {
      console.error('Failed to start location tracking:', error)
      return false
    }
  }

  async stopTracking(): Promise<void> {
    try {
      if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }
      this.isTracking = false
    } catch (error) {
      console.error('Failed to stop location tracking:', error)
    }
  }

  async getCurrentLocation(): Promise<LocationUpdate | null> {
    try {
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        return null
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed ?? 0,
        heading: location.coords.heading ?? 0,
        accuracy: location.coords.accuracy,
        battery_level: null, // Can be enhanced with react-native-device-battery-info
      }
    } catch (error) {
      console.error('Failed to get current location:', error)
      return null
    }
  }

  async submitLocation(location: LocationUpdate): Promise<boolean> {
    try {
      const token = await getToken()
      if (!token) {
        console.error('No authentication token available')
        await this.queueLocation({
          ...location,
          shipment_id: location.shipment_id ?? this.shipmentId ?? null,
          timestamp: location.timestamp ?? Date.now(),
        })
        return false
      }

      const response = await fetch(`${API_BASE}/tracking/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          accuracy: location.accuracy,
          battery_level: location.battery_level,
          shipment_id: location.shipment_id ?? this.shipmentId ?? null,
        }),
      })

      if (!response.ok) {
        await this.queueLocation({
          ...location,
          shipment_id: location.shipment_id ?? this.shipmentId ?? null,
          timestamp: location.timestamp ?? Date.now(),
        })
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to submit location:', error)
      await this.queueLocation({
        ...location,
        shipment_id: location.shipment_id ?? this.shipmentId ?? null,
        timestamp: location.timestamp ?? Date.now(),
      })
      return false
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking
  }

  async queueLocation(location: LocationUpdate): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(LOCATION_QUEUE_KEY)
      const queue: LocationUpdate[] = existingQueue ? JSON.parse(existingQueue) : []
      queue.push(location)
      await AsyncStorage.setItem(LOCATION_QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to queue location update:', error)
    }
  }

  async getQueuedLocations(): Promise<LocationUpdate[]> {
    try {
      const existingQueue = await AsyncStorage.getItem(LOCATION_QUEUE_KEY)
      return existingQueue ? (JSON.parse(existingQueue) as LocationUpdate[]) : []
    } catch (error) {
      console.error('Failed to load queued locations:', error)
      return []
    }
  }

  async syncQueuedLocations(): Promise<number> {
    const queuedLocations = await this.getQueuedLocations()
    if (!queuedLocations.length) {
      return 0
    }

    const remaining: LocationUpdate[] = []
    let syncedCount = 0

    for (const queuedLocation of queuedLocations) {
      const success = await this.submitLocation(queuedLocation)
      if (success) {
        syncedCount += 1
      } else {
        remaining.push(queuedLocation)
      }
    }

    if (remaining.length > 0) {
      await AsyncStorage.setItem(LOCATION_QUEUE_KEY, JSON.stringify(remaining))
    } else {
      await AsyncStorage.removeItem(LOCATION_QUEUE_KEY)
    }

    return syncedCount
  }

  get currentShipmentId(): number | null {
    return this.shipmentId
  }
}

// Register background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error)
    return
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] }
    if (locations && locations.length > 0) {
      for (const location of locations) {
        const service = locationTrackingService
        await service.submitLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed ?? 0,
          heading: location.coords.heading ?? 0,
          accuracy: location.coords.accuracy,
          battery_level: null,
          shipment_id: service.currentShipmentId,
          timestamp: location.timestamp,
        })
      }
    }
  }
})

export const locationTrackingService = new LocationTrackingService()
