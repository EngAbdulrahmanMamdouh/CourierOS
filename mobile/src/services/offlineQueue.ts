import AsyncStorage from '@react-native-async-storage/async-storage'

const QUEUE_KEY = 'driver-offline-queue'

export type OfflineOperation = {
  id: string
  type: string
  payload: Record<string, unknown>
  createdAt: string
}

export async function queueOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'createdAt'>) {
  const existing = await AsyncStorage.getItem(QUEUE_KEY)
  const items: OfflineOperation[] = existing ? JSON.parse(existing) : []
  const entry: OfflineOperation = {
    id: `${Date.now()}`,
    type: operation.type,
    payload: operation.payload,
    createdAt: new Date().toISOString(),
  }
  items.unshift(entry)
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  return entry
}

export async function getQueuedOperations() {
  const existing = await AsyncStorage.getItem(QUEUE_KEY)
  return existing ? (JSON.parse(existing) as OfflineOperation[]) : []
}

export async function getQueuedOperationCount() {
  return (await getQueuedOperations()).length
}

export async function syncQueuedOperations() {
  const operations = await getQueuedOperations()
  if (!operations.length) return 0
  await new Promise((resolve) => setTimeout(resolve, 700))
  await AsyncStorage.removeItem(QUEUE_KEY)
  return operations.length
}
