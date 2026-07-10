/**
 * LocationPermissionService - Handles all location permission requests
 * Manages both foreground and background permissions with user feedback
 */

import * as Location from 'expo-location'

export interface PermissionStatus {
  foreground: boolean
  background: boolean
  canRequest: boolean
}

class LocationPermissionService {
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      const fgStatus = await Location.getForegroundPermissionsAsync()
      const bgStatus = await Location.getBackgroundPermissionsAsync()

      return {
        foreground: fgStatus.status === 'granted',
        background: bgStatus.status === 'granted',
        canRequest: fgStatus.canAskAgain || bgStatus.canAskAgain,
      }
    } catch (error) {
      console.error('Failed to check permissions:', error)
      return {
        foreground: false,
        background: false,
        canRequest: false,
      }
    }
  }

  async requestForegroundPermission(): Promise<boolean> {
    try {
      const currentStatus = await Location.getForegroundPermissionsAsync()

      // Already granted
      if (currentStatus.status === 'granted') {
        return true
      }

      // Can't ask again
      if (!currentStatus.canAskAgain) {
        console.warn('Cannot request foreground permission - permanently denied')
        return false
      }

      const result = await Location.requestForegroundPermissionsAsync()
      return result.status === 'granted'
    } catch (error) {
      console.error('Failed to request foreground permission:', error)
      return false
    }
  }

  async requestBackgroundPermission(): Promise<boolean> {
    try {
      const currentStatus = await Location.getBackgroundPermissionsAsync()

      // Already granted
      if (currentStatus.status === 'granted') {
        return true
      }

      // Can't ask again
      if (!currentStatus.canAskAgain) {
        console.warn('Cannot request background permission - permanently denied')
        return false
      }

      const result = await Location.requestBackgroundPermissionsAsync()
      return result.status === 'granted'
    } catch (error) {
      console.error('Failed to request background permission:', error)
      return false
    }
  }

  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      // Request foreground first
      const fgGranted = await this.requestForegroundPermission()
      if (!fgGranted) {
        return {
          foreground: false,
          background: false,
          canRequest: false,
        }
      }

      // Then request background
      const bgGranted = await this.requestBackgroundPermission()

      return {
        foreground: fgGranted,
        background: bgGranted,
        canRequest: false,
      }
    } catch (error) {
      console.error('Failed to request all permissions:', error)
      return {
        foreground: false,
        background: false,
        canRequest: false,
      }
    }
  }

  async ensurePermissions(): Promise<boolean> {
    const status = await this.checkPermissions()

    if (status.foreground && status.background) {
      return true
    }

    if (!status.canRequest) {
      console.warn('Cannot request permissions - all requests denied')
      return status.foreground
    }

    return await this.requestForegroundPermission()
  }
}

export const locationPermissionService = new LocationPermissionService()
