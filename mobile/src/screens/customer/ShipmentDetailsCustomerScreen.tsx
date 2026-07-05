import React from 'react'
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Barcode, MapPinned, PackageCheck, QrCode, UserCircle2 } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

const placeholderShipment = {
  id: 'SHP-2098',
  status: 'In Transit',
  sender: 'City Logistics',
  receiver: 'Urban Market',
  address: '12 Creekside Blvd, Dubai',
  cod: '$120',
  timeline: [
    { label: 'Pickup received', time: '08:12' },
    { label: 'Departed origin hub', time: '08:40' },
    { label: 'Arrived checkpoint', time: '09:14' },
    { label: 'On the last mile', time: '09:58' },
  ],
}

export function ShipmentDetailsCustomerScreen({ route, navigation }: { route: any; navigation: any }) {
  const { colors } = useAppTheme()
  const shipment = route?.params?.shipment ?? placeholderShipment

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38bdf8', fontWeight: '700' }}>Back</Text>
        </Pressable>

        <PremiumCard title="Shipment details" subtitle={shipment.id}>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{shipment.receiver}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>{shipment.status}</Text>
          </View>
        </PremiumCard>

        <SectionHeader title="Tracking" subtitle="Timeline and package info" />
        <PremiumCard title="Status timeline" subtitle="Follow every step" style={{ marginTop: 12 }}>
          {shipment.timeline.map((step: any, index: number) => (
            <View key={index} style={{ marginTop: index === 0 ? 0 : 14 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{step.label}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{step.time}</Text>
            </View>
          ))}
        </PremiumCard>

        <PremiumCard title="Route details" subtitle="Customer delivery address" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MapPinned size={16} color="#38bdf8" />
            <Text style={{ color: '#fff', marginLeft: 10 }}>{shipment.address}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Sender</Text>
              <Text style={{ color: '#fff', marginTop: 4 }}>{shipment.sender}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Receiver</Text>
              <Text style={{ color: '#fff', marginTop: 4 }}>{shipment.receiver}</Text>
            </View>
          </View>
        </PremiumCard>

        <PremiumCard title="Scan codes" subtitle="Barcode and QR access" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, alignItems: 'center' }}>
              <Barcode size={34} color="#38bdf8" />
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 14 }}>Barcode</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, alignItems: 'center' }}>
              <QrCode size={34} color="#38bdf8" />
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 14 }}>QR Code</Text>
            </View>
          </View>
        </PremiumCard>

        <PremiumCard title="COD" subtitle="Payment status" style={{ marginTop: 12 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{shipment.cod}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Cash on delivery amount for this shipment.</Text>
        </PremiumCard>

        <PremiumCard title="Delivery history" subtitle="Your recent package updates" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <UserCircle2 size={16} color="#38bdf8" />
            <Text style={{ color: '#fff', marginLeft: 10 }}>Driver arrival scheduled in 12 minutes.</Text>
          </View>
        </PremiumCard>

        <Pressable onPress={() => Alert.alert('Help', 'Customer support is available through the backend.')} style={{ marginTop: 20, backgroundColor: '#34d399', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Contact support</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  )
}
