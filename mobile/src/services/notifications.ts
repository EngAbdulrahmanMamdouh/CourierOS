import * as Notifications from 'expo-notifications'

export type DriverNotificationType = 'new_assignment' | 'pickup_request' | 'schedule_change' | 'route_update'

export async function registerNotificationHandlers() {
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
  })
}

export async function triggerDriverNotification(type: DriverNotificationType, title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data: { type } },
      trigger: null,
    })
  } catch {
    // ignore notification scheduling failures in local development builds
  }
}

export const notificationHandlers = {
  newAssignment: () => triggerDriverNotification('new_assignment', 'New assignment', 'A new shipment has been assigned to you.'),
  pickupRequest: () => triggerDriverNotification('pickup_request', 'Pickup request', 'A pickup confirmation is required.'),
  scheduleChange: () => triggerDriverNotification('schedule_change', 'Schedule change', 'Your route has been updated.'),
  routeUpdate: () => triggerDriverNotification('route_update', 'Route update', 'Traffic conditions changed on your route.'),
}
