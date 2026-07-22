import React, { useMemo } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, Clock3, FileText, MapPinned, PackageCheck, Sparkles } from 'lucide-react-native'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SkeletonLoader } from '../../components/SkeletonLoader'
import { useAssignedShipmentsQuery, useDashboardStatsQuery } from '../../hooks/useShipmentQueries'

export function CustomerHomeScreen({ navigation }: { navigation: any }) {
  const dashboardQuery = useDashboardStatsQuery()
  const shipmentsQuery = useAssignedShipmentsQuery({ pageSize: 6 })

  const shipments = useMemo(() => shipmentsQuery.data?.pages.flat() ?? [], [shipmentsQuery.data])
  const loading = dashboardQuery.isLoading || shipmentsQuery.isLoading
  const error = dashboardQuery.error || shipmentsQuery.error

  const statistics = useMemo(() => [
    { title: 'Active shipments', value: dashboardQuery.data?.total_shipments ?? 0, icon: PackageCheck, tone: '#38bdf8' },
    { title: 'Pending', value: dashboardQuery.data?.pending ?? 0, icon: Clock3, tone: '#fbbf24' },
    { title: 'In transit', value: dashboardQuery.data?.in_transit ?? 0, icon: Sparkles, tone: '#34d399' },
    { title: 'Delivered', value: dashboardQuery.data?.delivered ?? 0, icon: Bell, tone: '#fb7185' },
  ], [dashboardQuery.data])

  const recentActivity = useMemo(() => shipments.slice(0, 3).map((shipment) => ({
    title: `${shipment.receiver_name} • ${shipment.status}`,
    time: shipment.updated_at ? new Date(shipment.updated_at).toLocaleString() : 'Recently updated',
  })), [shipments])

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>Good afternoon</Text>
          <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 8 }}>Track deliveries, request pickups, and manage alerts.</Text>
        </View>

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load customer dashboard.')} onRetry={() => { dashboardQuery.refetch(); shipmentsQuery.refetch() }} />
        ) : loading ? (
          <View style={{ gap: 16 }}>
            {[...Array(3)].map((_, index) => (
              <View key={index} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 18 }}>
                <SkeletonLoader height={22} width="60%" />
                <SkeletonLoader height={18} width="100%" />
              </View>
            ))}
          </View>
        ) : (
          <>
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
            {shipments.length === 0 ? (
              <EmptyState title="No shipments available" description="No shipment updates are available right now." />
            ) : shipments.slice(0, 3).map((shipment) => (
              <Pressable key={shipment.id} onPress={() => navigation.navigate('ShipmentDetails', { shipmentId: shipment.id, shipment })} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{shipment.receiver_name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{shipment.tracking_number ?? `#${shipment.id}`}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{shipment.status}</Text>
                  <Text style={{ color: '#38bdf8', fontWeight: '700' }}>{shipment.city}</Text>
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
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
