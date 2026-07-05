import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, Filter, MapPinned, Search, Truck } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'

const initialShipments = [
  { id: 'SHP-1001', priority: 'Urgent', title: 'Al Noor Pharmacy', address: '88 Marina Blvd, Dubai', eta: '12 min', status: 'Assigned' },
  { id: 'SHP-1002', priority: 'High', title: 'Mina Tower', address: '7th Street, Downtown', eta: '28 min', status: 'In Transit' },
  { id: 'SHP-1003', priority: 'Medium', title: 'Blue Lagoon Offices', address: 'Business Bay', eta: '42 min', status: 'Pending' },
  { id: 'SHP-1004', priority: 'Low', title: 'Ocean View Residences', address: 'Jumeirah', eta: '55 min', status: 'Assigned' },
  { id: 'SHP-1005', priority: 'Urgent', title: 'Cedar Market', address: 'Sheikh Zayed Road', eta: '65 min', status: 'Ready' },
]

export function TodayShipmentsScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'High' | 'Medium' | 'Low'>('All')
  const [shipments, setShipments] = useState(initialShipments)
  const [refreshing, setRefreshing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    setVisibleCount(3)
  }, [query, filter])

  const filtered = useMemo(() => {
    return shipments.filter((item) => {
      const matchesQuery = `${item.id} ${item.title} ${item.address}`.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'All' || item.priority === filter
      return matchesQuery && matchesFilter
    })
  }, [filter, query, shipments])

  const visible = filtered.slice(0, visibleCount)

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setShipments((current) => [{ id: 'SHP-1006', priority: 'High', title: 'Harbor Point', address: 'Al Quoz', eta: '9 min', status: 'Assigned' }, ...current])
      setRefreshing(false)
    }, 900)
  }

  const loadMore = () => {
    if (visibleCount < filtered.length) {
      setVisibleCount((current) => Math.min(current + 2, filtered.length))
    }
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListHeaderComponent={(
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 }}>Today</Text>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Today's shipments</Text>
              </View>
              <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 10 }} onPress={() => Alert.alert('Filters', 'Advanced filter builder is ready for the next release')}>
                <Filter size={18} color="#fff" />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 10 }}>
              <Search size={16} color="rgba(255,255,255,0.7)" />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search by id, name, address" placeholderTextColor="rgba(255,255,255,0.5)" style={{ flex: 1, color: '#fff', marginLeft: 8 }} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginTop: 12, paddingBottom: 6 }}>
              {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map((item) => (
                <Pressable key={item} onPress={() => setFilter(item)} style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: filter === item ? '#38bdf8' : 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: filter === item ? '#38bdf8' : 'rgba(255,255,255,0.14)' }}>
                  <Text style={{ color: filter === item ? '#fff' : 'rgba(255,255,255,0.8)', fontWeight: '700' }}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('ShipmentDetails', { shipment: item })} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{item.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.id}</Text>
              </View>
              <View style={{ backgroundColor: item.priority === 'Urgent' ? 'rgba(251,113,133,0.18)' : 'rgba(56,189,248,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: item.priority === 'Urgent' ? '#fb7185' : '#38bdf8', fontWeight: '700', fontSize: 12 }}>{item.priority}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <MapPinned size={15} color="#38bdf8" />
              <Text style={{ color: 'rgba(255,255,255,0.72)', marginLeft: 8, flex: 1 }}>{item.address}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock3 size={14} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>{item.eta}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Truck size={14} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>{item.status}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<PremiumCard title="No matching deliveries" subtitle="Try another search or change the priority filter." />}
      />
    </LinearGradient>
  )
}
