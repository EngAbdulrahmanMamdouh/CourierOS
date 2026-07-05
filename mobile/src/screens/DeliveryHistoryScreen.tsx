import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, FileText, MapPinned, PackageCheck, ShieldCheck } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { useAppTheme } from '../hooks/useTheme'

const historyData = [
  { id: 'SHP-1001', title: 'Al Noor Pharmacy', status: 'Delivered', eta: '09:42', note: 'Signature captured' },
  { id: 'SHP-1000', title: 'Mina Tower', status: 'Delivered', eta: '09:18', note: 'COD collected' },
  { id: 'SHP-0999', title: 'Blue Lagoon Offices', status: 'Delivered', eta: '08:55', note: 'Pickup confirmed' },
  { id: 'SHP-0998', title: 'Ocean View Residences', status: 'Delivered', eta: '08:30', note: 'Photo evidence attached' },
]

export function DeliveryHistoryScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => historyData.filter((item) => `${item.id} ${item.title} ${item.status}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <View style={{ padding: 20, paddingBottom: 16 }}>
        <SectionHeader title="Delivery history" subtitle="Review completed handoffs" />

        <PremiumCard title="Search completed deliveries" subtitle="Search by shipment ID or recipient">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search history"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ color: '#fff', marginTop: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', paddingVertical: 10 }}
          />
        </PremiumCard>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 48 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ShipmentDetails', { shipment: item })} style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{item.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.id}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(52,211,153,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: '#34d399', fontWeight: '700' }}>{item.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock3 size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>{item.eta}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FileText size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>{item.note}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <PremiumCard title="No matching deliveries" subtitle="Try a different search term." style={{ marginTop: 12 }} />
          }
        />
      </View>
    </LinearGradient>
  )
}
