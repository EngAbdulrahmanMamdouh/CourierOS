import React, { useMemo } from 'react'
import { FlatList, Pressable, ScrollView, Text, View, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, MapPinned, PackageCheck, CircleDollarSign, CalendarDays, Sparkles } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { ShipmentCard } from '../components/ShipmentCard'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { useAuth } from '../context/AuthContext'
import { useAssignedShipmentsQuery, useDashboardStatsQuery } from '../hooks/useShipmentQueries'

const quickActions = [
  { label: 'Route', icon: MapPinned, screen: 'Shipments' },
  { label: 'Deliveries', icon: PackageCheck, screen: 'Shipments' },
  { label: 'COD', icon: CircleDollarSign, screen: 'Shipments' },
  { label: 'History', icon: Sparkles, screen: 'History' },
]

export function HomeDashboardScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const { user } = useAuth()
  const dashboardQuery = useDashboardStatsQuery()
  const shipmentsQuery = useAssignedShipmentsQuery({ status: 'Assigned', pageSize: 20 })

  const shipments = useMemo(() => shipmentsQuery.data?.pages.flat() ?? [], [shipmentsQuery.data])
  const codCollected = useMemo(
    () => shipments.reduce((sum, shipment) => sum + (shipment.cod_amount ?? 0), 0),
    [shipments],
  )

  const loading = dashboardQuery.isLoading || shipmentsQuery.isLoading
  const error = dashboardQuery.error || shipmentsQuery.error

  const onRefresh = () => {
    dashboardQuery.refetch()
    shipmentsQuery.refetch()
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 }}>Courier dashboard</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>Good morning, {user?.full_name ?? user?.username ?? 'Courier'}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Bell size={18} color="#fff" />
          </Pressable>
        </View>

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load dashboard.')} onRetry={onRefresh} />
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
            <PremiumCard title="Today’s snapshot" subtitle="Your assigned delivery metrics">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {[
                  { title: 'Assigned', value: dashboardQuery.data?.total_shipments ?? 0, icon: PackageCheck },
                  { title: 'Pending', value: dashboardQuery.data?.pending ?? 0, icon: CalendarDays },
                  { title: 'Delivered', value: dashboardQuery.data?.delivered ?? 0, icon: Sparkles },
                  { title: 'COD today', value: `$${codCollected.toFixed(2)}`, icon: CircleDollarSign },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <View key={item.title} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Icon size={18} color="#38bdf8" />
                        <Text style={{ color: '#fff', fontWeight: '700' }}>{item.title}</Text>
                      </View>
                      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 12 }}>{item.value}</Text>
                    </View>
                  )
                })}
              </View>
            </PremiumCard>

            <PremiumCard title="Quick actions" subtitle="Jump directly to your shipment workflow" style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {quickActions.map((item) => {
                  const Icon = item.icon
                  return (
                    <Pressable key={item.label} onPress={() => navigation.navigate(item.screen)} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                      <Icon size={18} color="#38bdf8" />
                      <Text style={{ color: '#fff', fontWeight: '700', marginTop: 10 }}>{item.label}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </PremiumCard>

            <SectionHeader title="Assigned shipments" subtitle="Live list for your current shift" />
            {shipments.length === 0 ? (
              <EmptyState title="No shipments assigned" description="Your courier list is empty. Pull to refresh and check dispatch." />
            ) : (
              shipments.slice(0, 3).map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} onPress={() => navigation.navigate('ShipmentDetails', { shipmentId: shipment.id, shipment })} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
