import AsyncStorage from '@react-native-async-storage/async-storage'
import { OfflineOperation } from '../types'
import { submitProofOfDelivery, submitCodCollection, updateShipmentStatus } from './shipment'

const QUEUE_KEY = 'driver-offline-queue'

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

export async function saveQueuedOperations(operations: OfflineOperation[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(operations))
}

export async function clearQueuedOperations() {
  await AsyncStorage.removeItem(QUEUE_KEY)
}

export async function getQueuedOperationCount() {
  return (await getQueuedOperations()).length
}

async function processOperation(operation: OfflineOperation) {
  switch (operation.type) {
    case 'proof_of_delivery': {
      const payload = operation.payload as {
        shipmentId: number | string
        recipientName: string
        relation: string
        notes: string
        photos: string[]
        signatureData: string
      }
      return submitProofOfDelivery(payload.shipmentId, {
        recipientName: payload.recipientName,
        relation: payload.relation,
        notes: payload.notes,
        photos: payload.photos,
        signatureData: payload.signatureData,
      })
    }
    case 'cod_collection': {
      const payload = operation.payload as {
        shipmentId: number | string
        amountDue: number
        cashTendered: number
        changeDue: number
      }
      return submitCodCollection(payload.shipmentId, {
        amountDue: payload.amountDue,
        cashTendered: payload.cashTendered,
        changeDue: payload.changeDue,
      })
    }
    case 'shipment_status': {
      const payload = operation.payload as {
        shipmentId: number | string
        status: string
      }
      return updateShipmentStatus(payload.shipmentId, payload.status)
    }
    default: {
      throw new Error(`Unsupported offline operation type: ${operation.type}`)
    }
  }
}

export async function syncQueuedOperations() {
  const operations = await getQueuedOperations()
  if (!operations.length) return 0

  const remaining = [...operations]
  const completed: OfflineOperation[] = []

  for (const operation of operations) {
    try {
      await processOperation(operation)
      completed.push(operation)
      remaining.shift()
    } catch {
      break
    }
  }

  if (!remaining.length) {
    await clearQueuedOperations()
  } else {
    await saveQueuedOperations(remaining)
  }

  return completed.length
}
