import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, MapPinned, Navigation2 } from 'lucide-react-native'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SkeletonLoader } from '../../components/SkeletonLoader'
import { useAssignedShipmentsQuery, useShipmentDetailsQuery, useShipmentTrackingQuery } from '../../hooks/useShipmentQueries'

export function LiveTrackingScreen() {
  const shipmentsQuery = useAssignedShipmentsQuery({ pageSize: 1 })
  const shipments = shipmentsQuery.data?.pages.flat() ?? []
  const shipmentId = shipments[0]?.id

  const detailsQuery = useShipmentDetailsQuery(typeof shipmentId === 'number' ? shipmentId : undefined)
  const trackingQuery = useShipmentTrackingQuery(typeof shipmentId === 'number' ? shipmentId : undefined)

  const loading = shipmentsQuery.isLoading || detailsQuery.isLoading || trackingQuery.isLoading
  const error = shipmentsQuery.error || detailsQuery.error || trackingQuery.error
  const shipment = detailsQuery.data
  const trackingData = trackingQuery.data

  const timelineItems = trackingData?.history?.length
    ? trackingData.history.map((item) => ({
        label: item.new_status,
        time: new Date(item.changed_at).toLocaleString(),
      }))
    : shipment
      ? [{ label: shipment.status, time: shipment.updated_at ? new Date(shipment.updated_at).toLocaleString() : 'Latest known update' }]
      : []

  const latestUpdate = shipment?.updated_at
    ? new Date(shipment.updated_at).toLocaleString()
    : trackingData?.history?.[0]?.changed_at
      ? new Date(trackingData.history[0].changed_at).toLocaleString()
      : 'Awaiting update'

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <SectionHeader title="Live tracking" subtitle="Driver location and ETA" />

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load shipment tracking.')} onRetry={() => { shipmentsQuery.refetch(); detailsQuery.refetch(); trackingQuery.refetch() }} />
        ) : loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonLoader height={160} width="100%" />
            <SkeletonLoader height={110} width="100%" />
            <SkeletonLoader height={90} width="100%" />
          </View>
        ) : !shipment ? (
          <EmptyState title="No shipment available" description="There is no shipment available to track right now." />
        ) : (
          <>
            <PremiumCard title="Route preview" subtitle="Latest shipment information">
              <View style={{ height: 240, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' }}>
                <MapPinned size={40} color="#38bdf8" />
                <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>{shipment.city}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>Map integration is ready for future GPS wiring. Current location is based on the latest backend shipment update.</Text>
              </View>
            </PremiumCard>

            <PremiumCard title="Shipment status" subtitle="Latest known position" style={{ marginTop: 12 }}>
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{trackingData?.current_status ?? shipment.status}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Receiver: {shipment.receiver_name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Phone: {shipment.receiver_phone || 'Not provided'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>City: {shipment.city}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>COD: {shipment.cod_amount !== undefined ? `$${shipment.cod_amount.toFixed(2)}` : 'Not available'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Last updated: {latestUpdate}</Text>
              </View>
            </PremiumCard>

            <PremiumCard title="Estimated arrival" subtitle="Expected delivery window" style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)' }}>ETA</Text>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6 }}>{shipment.estimated_delivery_days ? `${shipment.estimated_delivery_days} day(s)` : 'Pending'}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(56,189,248,0.16)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: '#38bdf8', fontWeight: '700' }}>{trackingData?.current_status ?? shipment.status}</Text>
                </View>
              </View>
            </PremiumCard>

            <PremiumCard title="Shipment timeline" subtitle="Backend history" style={{ marginTop: 12 }}>
              {timelineItems.map((item, index) => (
                <View key={`${item.label}-${index}`} style={{ marginTop: index === 0 ? 0 : 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock3 size={14} color="#38bdf8" />
                    <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>{item.label}</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{item.time}</Text>
                </View>
              ))}
            </PremiumCard>

            <Pressable onPress={() => {}} style={{ marginTop: 18, backgroundColor: '#38bdf8', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Open navigation app</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
