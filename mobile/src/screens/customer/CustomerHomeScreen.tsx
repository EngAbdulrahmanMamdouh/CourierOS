import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, Clock3, FileText, MapPinned, PackageCheck, Sparkles, UserCircle2 } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

const activeShipments = [
  { id: 'SHP-2098', title: 'Urban Market', status: 'In Transit', eta: '12 min' },
  { id: 'SHP-2104', title: 'Luxury Plaza', status: 'Out for delivery', eta: '28 min' },
  { id: 'SHP-2109', title: 'Gulf Pharmacy', status: 'Pending pickup', eta: '45 min' },
]

const statistics = [
  { title: 'Active shipments', value: '18', icon: PackageCheck, tone: '#38bdf8' },
  { title: 'On-time rate', value: '96%', icon: Sparkles, tone: '#34d399' },
  { title: 'Pending requests', value: '3', icon: Clock3, tone: '#fbbf24' },
  { title: 'Promotions', value: '2 active', icon: Bell, tone: '#fb7185' },
]

const recentActivity = [
  { title: 'Shipment SHP-2098 departed hub', time: '5 min ago' },
  { title: 'Driver en route to Luxury Plaza', time: '22 min ago' },
  { title: 'Pickup request SHP-2109 created', time: '1h ago' },
]

export function CustomerHomeScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () => activeShipments.filter((item) => `${item.id} ${item.title}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  )

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>Good afternoon</Text>
          <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 8 }}>Track deliveries, request pickups, and manage alerts.</Text>
        </View>

        <PremiumCard title="Shipment stats" subtitle="Live customer dashboard">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            {statistics.map((stat) => (
              <View key={stat.title} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: `${stat.tone}22`, justifyContent: 'center', alignItems: 'center' }}>
                  <stat.icon size={18} color={stat.tone} />
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 }}>{stat.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 12 }}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </PremiumCard>

        <PremiumCard title="Quick actions" subtitle="Speed through your customer tasks" style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {[
              { label: 'My shipments', icon: PackageCheck, action: () => navigation.navigate('My Shipments') },
              { label: 'Track live', icon: MapPinned, action: () => navigation.navigate('Tracking') },
              { label: 'Request pickup', icon: FileText, action: () => navigation.navigate('PickupRequest') },
              { label: 'Notifications', icon: Bell, action: () => navigation.navigate('Alerts') },
            ].map((item) => (
              <Pressable key={item.label} onPress={item.action} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <item.icon size={18} color="#38bdf8" />
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 10 }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </PremiumCard>

        <SectionHeader title="Active shipments" subtitle="Your latest packages in transit" />
        {filtered.map((item) => (
          <Pressable key={item.id} onPress={() => navigation.navigate('ShipmentDetails', { shipment: item })} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{item.title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{item.id}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{item.status}</Text>
              <Text style={{ color: '#38bdf8', fontWeight: '700' }}>{item.eta}</Text>
            </View>
          </Pressable>
        ))}

        <SectionHeader title="Recent activity" subtitle="Delivery pulse and updates" style={{ marginTop: 22 }} />
        {recentActivity.map((item) => (
          <View key={item.title} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  )
}
