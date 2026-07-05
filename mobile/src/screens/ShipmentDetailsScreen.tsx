import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, View, Text, Pressable, Linking, Alert, TextInput, Vibration } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Barcode, Camera, CircleDollarSign, Copy, FileText, MapPinned, MessageSquare, PhoneCall, ScanLine, Send, Signature, Smartphone, Truck, UserRound, WifiOff, Wifi } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { queueOfflineOperation, getQueuedOperationCount, syncQueuedOperations } from '../services/offlineQueue'
import { notificationHandlers } from '../services/notifications'

const shipment = {
  id: 'SHP-1001',
  status: 'Assigned',
  priority: 'Urgent',
  sender: 'NorthStar Supply',
  receiver: 'Al Noor Pharmacy',
  phone: '+971558112345',
  address: '88 Marina Blvd, Dubai',
  cod: '$180',
  notes: 'Fragile - handle with care. Customer prefers delivery after 4 PM.',
  timeline: [
    { title: 'Pickup confirmed', time: '08:20', detail: 'Driver assigned at NorthStar hub' },
    { title: 'On route', time: '09:10', detail: 'Vehicle checked and departed' },
    { title: 'Arrived at destination', time: '09:48', detail: 'Waiting for recipient confirmation' },
  ],
}

export function ShipmentDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { colors } = useAppTheme()
  const item = route?.params?.shipment ?? shipment
  const [status, setStatus] = useState(item.status || shipment.status)
  const [notes, setNotes] = useState(shipment.notes)
  const [proofPhotos, setProofPhotos] = useState<string[]>([])
  const [codCollected, setCodCollected] = useState(120)
  const [offlineCount, setOfflineCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    getQueuedOperationCount().then(setOfflineCount)
  }, [])

  const openMaps = () => {
    const url = 'https://www.google.com/maps/search/?api=1&query=88+Marina+Blvd+Dubai'
    Linking.openURL(url)
  }

  const copyAddress = () => {
    Alert.alert('Address', shipment.address)
  }

  const progressStates = ['Assigned', 'Accepted', 'Picked Up', 'In Transit', 'Arrived', 'Delivered']
  const currentIndex = progressStates.indexOf(status)

  const actions = [
    { label: 'Navigate', icon: MapPinned, onPress: openMaps },
    { label: 'Call', icon: PhoneCall, onPress: () => Linking.openURL(`tel:${shipment.phone}`) },
    { label: 'SMS', icon: MessageSquare, onPress: () => Linking.openURL(`sms:${shipment.phone}`) },
    { label: 'Scan', icon: ScanLine, onPress: () => navigation.navigate('BarcodeScanner') },
    { label: 'Copy', icon: Copy, onPress: copyAddress },
    { label: 'COD', icon: CircleDollarSign, onPress: () => navigation.navigate('CODCollection', { shipment: item }) },
    { label: 'Sign', icon: Signature, onPress: () => navigation.navigate('ProofOfDelivery', { shipment: item }) },
    { label: 'Photo', icon: Camera, onPress: () => navigation.navigate('ProofOfDelivery', { shipment: item }) },
  ]

  const updateStatus = async (nextStatus: string, reason: string) => {
    Alert.alert('Confirm change', `${reason}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        Vibration.vibrate(70)
        setStatus(nextStatus)
        await queueOfflineOperation({ type: 'status_update', payload: { shipmentId: item.id || shipment.id, status: nextStatus } })
        setOfflineCount((value) => value + 1)
      } },
    ])
  }

  const collectCod = async () => {
    Alert.alert('COD collection', `Collect ${shipment.cod} from the customer?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        Vibration.vibrate(70)
        setCodCollected(180)
        await queueOfflineOperation({ type: 'cod_collection', payload: { shipmentId: item.id || shipment.id, amount: 180 } })
        setOfflineCount((value) => value + 1)
      } },
    ])
  }

  const syncNow = async () => {
    setSyncing(true)
    const count = await syncQueuedOperations()
    setOfflineCount(0)
    setSyncing(false)
    Alert.alert('Synchronization complete', `${count} queued operations synced.`)
  }

  const remainingCod = useMemo(() => 180 - codCollected, [codCollected])

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Back</Text>
        </Pressable>

        <PremiumCard title={item.title || shipment.receiver} subtitle={`Tracking • ${item.id || shipment.id}`}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{item.id || shipment.id}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{status}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(56,189,248,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: '#38bdf8', fontWeight: '700' }}>{item.priority || shipment.priority}</Text>
            </View>
          </View>
        </PremiumCard>

        <SectionHeader title="Shipment overview" subtitle="Complete package and customer details" />
        <PremiumCard title="Customer details" subtitle="Primary contact and destination">
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <UserRound size={16} color="#38bdf8" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>Sender: {shipment.sender}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <UserRound size={16} color="#38bdf8" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>Receiver: {shipment.receiver}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <PhoneCall size={16} color="#38bdf8" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>{shipment.phone}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPinned size={16} color="#38bdf8" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>{shipment.address}</Text>
            </View>
          </View>
        </PremiumCard>

        <PremiumCard title="COD & delivery" subtitle="Cash handling and proof collection" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Amount due</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{shipment.cod}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(52,211,153,0.16)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: '#34d399', fontWeight: '700' }}>Ready to collect</Text>
            </View>
          </View>
          <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.72)' }}>Collected: ${codCollected}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>Remaining: ${remainingCod}</Text>
            <Pressable onPress={collectCod} style={{ marginTop: 10, backgroundColor: '#38bdf8', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm collection</Text>
            </Pressable>
          </View>
        </PremiumCard>

        <PremiumCard title="Operational workflow" subtitle="Move the delivery through the complete courier lifecycle" style={{ marginTop: 12 }}>
          <View style={{ marginTop: 10 }}>
            {progressStates.map((step, index) => {
              const active = index <= currentIndex
              return (
                <Pressable key={step} onPress={() => updateStatus(step, `Advance to ${step}`)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: active ? '#38bdf8' : 'rgba(255,255,255,0.3)' }} />
                  <Text style={{ color: active ? '#fff' : 'rgba(255,255,255,0.65)', marginLeft: 10, fontWeight: '700' }}>{step}</Text>
                </Pressable>
              )
            })}
          </View>
        </PremiumCard>

        <PremiumCard title="Actions" subtitle="Operational controls" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <Pressable key={index} onPress={action.onPress} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <Icon size={18} color="#38bdf8" />
                  <Text style={{ color: '#fff', fontWeight: '700', marginTop: 8 }}>{action.label}</Text>
                </Pressable>
              )
            })}
          </View>
        </PremiumCard>

        <PremiumCard title="Timeline" subtitle="Progress and checkpoints" style={{ marginTop: 12 }}>
          {shipment.timeline.map((step, index) => (
            <View key={index} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginTop: 2, width: 10, height: 10, borderRadius: 999, backgroundColor: '#38bdf8' }} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{step.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{step.time}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>{step.detail}</Text>
              </View>
            </View>
          ))}
        </PremiumCard>

        <PremiumCard title="Proof & documents" subtitle="Barcode, QR, notes, and signatures" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 12 }}>
              <Barcode size={18} color="#38bdf8" />
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 8 }}>Barcode</Text>
            </View>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 12 }}>
              <ScanLine size={18} color="#38bdf8" />
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 8 }}>QR Code</Text>
            </View>
          </View>
          <View style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={16} color="#38bdf8" />
              <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Notes</Text>
            </View>
            <TextInput multiline numberOfLines={3} value={notes} onChangeText={setNotes} placeholder="Add delivery notes" placeholderTextColor="rgba(255,255,255,0.4)" style={{ color: '#fff', marginTop: 8, minHeight: 72, textAlignVertical: 'top' }} />
          </View>
          <Pressable onPress={() => navigation.navigate('ProofOfDelivery', { shipment: item })} style={{ marginTop: 10, backgroundColor: '#34d399', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm delivery</Text>
          </Pressable>
        </PremiumCard>

        <PremiumCard title="Offline sync" subtitle="Local queue and connection recovery" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {offlineCount > 0 ? <WifiOff size={16} color="#fb923c" /> : <Wifi size={16} color="#34d399" />}
            <Text style={{ color: '#fff', marginLeft: 8 }}>{offlineCount > 0 ? `${offlineCount} queued updates` : 'All changes synchronized'}</Text>
          </View>
          <Pressable onPress={syncNow} disabled={syncing} style={{ marginTop: 10, backgroundColor: syncing ? 'rgba(56,189,248,0.5)' : '#38bdf8', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{syncing ? 'Synchronizing…' : 'Sync now'}</Text>
          </Pressable>
          <Pressable onPress={() => notificationHandlers.newAssignment()} style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Prepare notification preview</Text>
          </Pressable>
        </PremiumCard>
      </ScrollView>
    </LinearGradient>
  )
}
