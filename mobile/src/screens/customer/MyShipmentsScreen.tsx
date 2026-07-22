import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, MapPinned, Search } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SkeletonLoader } from '../../components/SkeletonLoader'
import { useAssignedShipmentsQuery } from '../../hooks/useShipmentQueries'

const filters = ['All', 'In Transit', 'Out for delivery', 'Pending pickup', 'Delivered'] as const

export function MyShipmentsScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<typeof filters[number]>('All')
  const [visibleCount, setVisibleCount] = useState(4)

  const normalizedFilter = filter === 'Out for delivery' ? 'In Transit' : filter === 'Pending pickup' ? 'Pending' : filter
  const shipmentsQuery = useAssignedShipmentsQuery({ status: normalizedFilter === 'All' ? undefined : normalizedFilter, search: query, pageSize: 10 })

  const shipments = useMemo(() => shipmentsQuery.data?.pages.flat() ?? [], [shipmentsQuery.data])
  const visible = shipments.slice(0, visibleCount)
  const loading = shipmentsQuery.isLoading
  const refreshing = shipmentsQuery.isRefetching
  const error = shipmentsQuery.error

  useEffect(() => {
    setVisibleCount(4)
  }, [filter, query])

  const onRefresh = () => shipmentsQuery.refetch()

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

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load shipments.')} onRetry={onRefresh} />
        ) : loading ? (
          <View style={{ marginTop: 16 }}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={{ borderRadius: 24, marginTop: 10, padding: 18, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <SkeletonLoader height={22} width="60%" />
                <SkeletonLoader height={16} width="100%" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingTop: 18, paddingBottom: 48 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ShipmentDetails', { shipmentId: item.id, shipment: item })} style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: '#fff', fontWeight: '800' }}>{item.receiver_name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.tracking_number ?? `#${item.id}`}</Text>
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
                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Updated'}</Text>
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={<EmptyState title="No shipments match your search" description="Try a different search term or filter." />}
            onEndReached={() => setVisibleCount((count) => Math.min(count + 2, shipments.length))}
            onEndReachedThreshold={0.4}
          />
        )}
      </View>
    </LinearGradient>
  )
}
