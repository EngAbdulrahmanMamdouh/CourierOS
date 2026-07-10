import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Filter, MapPinned, Search, Truck } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { ShipmentCard } from '../components/ShipmentCard'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { useAssignedShipmentsQuery } from '../hooks/useShipmentQueries'

const statusOptions = ['All', 'Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'] as const

type StatusOption = (typeof statusOptions)[number]

export function TodayShipmentsScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusOption>('All')

  const query = useAssignedShipmentsQuery({ status: status === 'All' ? undefined : status, search, pageSize: 20 })

  const shipments = useMemo(() => query.data?.pages.flat() ?? [], [query.data])
  const loading = query.isLoading
  const refreshing = query.isRefetching
  const error = query.error

  const onRefresh = () => query.refetch()
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage()
    }
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <SectionHeader title="Assigned shipments" subtitle="Search, filter, and manage your deliveries" />

        <PremiumCard title="Search and filter" subtitle="Refine your shipment list by tracking or status">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by tracking number"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ color: '#fff', marginTop: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', paddingVertical: 10 }}
          />
          <View style={{ flexDirection: 'row', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
            {statusOptions.map((option) => (
              <Pressable key={option} onPress={() => setStatus(option)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: status === option ? '#38bdf8' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: status === option ? '#38bdf8' : 'rgba(255,255,255,0.14)' }}>
                <Text style={{ color: status === option ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: '700' }}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </PremiumCard>

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load shipments.')} onRetry={onRefresh} />
        ) : loading ? (
          <View>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={{ borderRadius: 24, marginTop: 14, padding: 18, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <SkeletonLoader height={22} width="60%" />
                <SkeletonLoader height={16} width="100%" />
                <SkeletonLoader height={16} width="90%" />
              </View>
            ))}
          </View>
        ) : shipments.length === 0 ? (
          <EmptyState title="No shipments found" description="Try another search term or refresh to load the latest assignments." />
        ) : (
          <FlatList
            data={shipments}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => (
              <ShipmentCard
                shipment={item}
                onPress={() => navigation.navigate('ShipmentDetails', { shipmentId: item.id, shipment: item })}
              />
            )}
            contentContainerStyle={{ paddingBottom: 48 }}
            ListFooterComponent={query.isFetchingNextPage ? <SkeletonLoader height={80} /> : null}
          />
        )}
      </View>
    </LinearGradient>
  )
}
