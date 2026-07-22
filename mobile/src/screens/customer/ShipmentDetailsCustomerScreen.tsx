import React, { useMemo } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Barcode, MapPinned, QrCode, UserCircle2 } from 'lucide-react-native'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SkeletonLoader } from '../../components/SkeletonLoader'
import { useShipmentDetailsQuery, useShipmentTrackingQuery } from '../../hooks/useShipmentQueries'

export function ShipmentDetailsCustomerScreen({ route, navigation }: { route: any; navigation: any }) {
  const initialShipment = route?.params?.shipment
  const shipmentId = route?.params?.shipmentId ?? initialShipment?.id
  const detailsQuery = useShipmentDetailsQuery(typeof shipmentId === 'number' ? shipmentId : Number(shipmentId), initialShipment)
  const trackingQuery = useShipmentTrackingQuery(typeof shipmentId === 'number' ? shipmentId : Number(shipmentId))

  const shipment = detailsQuery.data ?? initialShipment
  const loading = detailsQuery.isLoading || trackingQuery.isLoading
  const error = detailsQuery.error || trackingQuery.error

  const timelineItems = useMemo(() => {
    const history = trackingQuery.data?.history ?? []
    if (history.length > 0) {
      return history.map((item) => ({
        label: item.new_status,
        detail: `Updated by ${item.changed_by ?? 'system'}`,
        time: new Date(item.changed_at).toLocaleString(),
      }))
    }

    return [{ label: shipment?.status ?? 'Status updated', detail: 'No detailed timeline available yet.', time: shipment?.updated_at ? new Date(shipment.updated_at).toLocaleString() : 'Pending' }]
  }, [shipment, trackingQuery.data])

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#38bdf8', fontWeight: '700' }}>Back</Text>
        </Pressable>

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load shipment details.')} onRetry={() => { detailsQuery.refetch(); trackingQuery.refetch() }} />
        ) : loading ? (
          <View style={{ gap: 16 }}>
            <SkeletonLoader height={24} width="70%" />
            <SkeletonLoader height={140} width="100%" />
            <SkeletonLoader height={18} width="100%" />
          </View>
        ) : !shipment ? (
          <EmptyState title="Shipment not found" description="This shipment cannot be displayed right now." />
        ) : (
          <>
            <PremiumCard title="Shipment details" subtitle={shipment.tracking_number ?? `#${shipment.id}`}>
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{shipment.receiver_name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>{shipment.status}</Text>
              </View>
            </PremiumCard>

            <SectionHeader title="Tracking" subtitle="Timeline and package info" />
            <PremiumCard title="Status timeline" subtitle="Follow every step" style={{ marginTop: 12 }}>
              {timelineItems.map((step, index) => (
                <View key={`${step.label}-${index}`} style={{ marginTop: index === 0 ? 0 : 14 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{step.label}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{step.detail}</Text>
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
                  <Text style={{ color: '#fff', marginTop: 4 }}>{shipment.sender_name}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Receiver</Text>
                  <Text style={{ color: '#fff', marginTop: 4 }}>{shipment.receiver_name}</Text>
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
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>${shipment.cod_amount?.toFixed(2) ?? '0.00'}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Cash on delivery amount for this shipment.</Text>
            </PremiumCard>

            <PremiumCard title="Delivery history" subtitle="Your recent package updates" style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <UserCircle2 size={16} color="#38bdf8" />
                <Text style={{ color: '#fff', marginLeft: 10 }}>{shipment.status}</Text>
              </View>
            </PremiumCard>

            <Pressable onPress={() => Alert.alert('Help', 'Customer support is available through the backend.')} style={{ marginTop: 20, backgroundColor: '#34d399', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Contact support</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
