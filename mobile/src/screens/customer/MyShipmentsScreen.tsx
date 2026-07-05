import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, Filter, MapPinned, PackageCheck, Search } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

const shipments = [
  { id: 'SHP-2098', receiver: 'Urban Market', status: 'In Transit', city: 'Dubai', eta: '12 min' },
  { id: 'SHP-2104', receiver: 'Luxury Plaza', status: 'Out for delivery', city: 'Abu Dhabi', eta: '28 min' },
  { id: 'SHP-2110', receiver: 'Gulf Pharmacy', status: 'Pending pickup', city: 'Sharjah', eta: '45 min' },
  { id: 'SHP-2115', receiver: 'Sun Tower', status: 'Delivered', city: 'Dubai', eta: '1d ago' },
  { id: 'SHP-2118', receiver: 'Cedar Mall', status: 'Delivered', city: 'Dubai', eta: '2d ago' },
]

const filters = ['All', 'In Transit', 'Out for delivery', 'Pending pickup', 'Delivered'] as const

export function MyShipmentsScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<typeof filters[number]>('All')
  const [visibleCount, setVisibleCount] = useState(4)

  const filtered = useMemo(
    () => shipments.filter((item) => {
      const matchesQuery = `${item.id} ${item.receiver} ${item.city}`.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'All' || item.status === filter
      return matchesQuery && matchesFilter
    }),
    [filter, query],
  )

  const visible = filtered.slice(0, visibleCount)

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <View style={{ padding: 20, paddingBottom: 16, flex: 1 }}>
        <SectionHeader title="My shipments" subtitle="Search, filter, and track every package" />

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 10 }}>
          <Search size={18} color="rgba(255,255,255,0.7)" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search shipments" placeholderTextColor="rgba(255,255,255,0.5)" style={{ flex: 1, color: '#fff', marginLeft: 10 }} />
        </View>

        <View style={{ flexDirection: 'row', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
          {filters.map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: filter === item ? '#38bdf8' : 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: filter === item ? '#fff' : 'rgba(255,255,255,0.8)', fontWeight: '700' }}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 18, paddingBottom: 48 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ShipmentDetails', { shipment: item })} style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>{item.receiver}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.id}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(56,189,248,0.16)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: '#38bdf8', fontWeight: '700', fontSize: 12 }}>{item.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPinned size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>{item.city}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock3 size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>{item.eta}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<View style={{ marginTop: 20 }}><Text style={{ color: '#fff', textAlign: 'center' }}>No shipments match your search.</Text></View>}
          onEndReached={() => setVisibleCount((count) => Math.min(count + 2, filtered.length))}
          onEndReachedThreshold={0.4}
        />
      </View>
    </LinearGradient>
  )
}
