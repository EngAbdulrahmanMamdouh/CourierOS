import React, { useMemo, useState } from 'react'
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Camera, CircleDollarSign, FileText, MapPinned, MessageSquare, PhoneCall, ScanLine, Signature, Truck, UserRound } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { useShipmentDetailsQuery, useShipmentHistoryQuery, useUpdateShipmentStatusMutation } from '../hooks/useShipmentQueries'
import { ShipmentDetail } from '../types'

const actionStates = [
  { key: 'In Transit', label: 'Start Delivery' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
]

export function ShipmentDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { colors } = useAppTheme()
  const routeShipment = route?.params?.shipment as ShipmentDetail | undefined
  const shipmentId = route?.params?.shipmentId ?? routeShipment?.id
  const [notes, setNotes] = useState(routeShipment?.notes ?? '')

  const detailsQuery = useShipmentDetailsQuery(Number(shipmentId), routeShipment)
  const historyQuery = useShipmentHistoryQuery(Number(shipmentId))
  const statusMutation = useUpdateShipmentStatusMutation()

  const shipment = detailsQuery.data
  const history = historyQuery.data ?? []
  const loading = detailsQuery.isLoading
  const error = detailsQuery.error
  const isUpdating = statusMutation.isPending

  const handleStatusChange = (newStatus: string) => {
    if (!shipment) {
      return
    }

    const title = newStatus === 'Delivered' ? 'Confirm delivery' : newStatus === 'Cancelled' ? 'Cancel shipment' : 'Start delivery'
    Alert.alert(title, `Mark shipment as ${newStatus}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => statusMutation.mutate({ shipmentId: shipment.id, status: newStatus }),
      },
    ])
  }

  const timelineItems = useMemo(
    () => history.map((item) => ({
      id: item.id,
      title: item.new_status,
      detail: `Updated by ${item.changed_by ?? 'system'}`,
      time: new Date(item.changed_at).toLocaleString(),
    })),
    [history],
  )

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Back</Text>
        </Pressable>

        {error ? (
          <ErrorState message={String(error instanceof Error ? error.message : 'Unable to load shipment details.')} onRetry={() => detailsQuery.refetch()} />
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
            <PremiumCard title={shipment.receiver_name} subtitle={`Tracking • ${shipment.tracking_number ?? shipment.id}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{shipment.tracking_number ?? `#${shipment.id}`}</Text>
                  <StatusBadge status={shipment.status} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>City</Text>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{shipment.city}</Text>
                </View>
              </View>
            </PremiumCard>

            <PremiumCard title="Shipment details" subtitle="Full package and customer information" style={{ marginTop: 12 }}>
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Receiver</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{shipment.receiver_name}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Phone</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{shipment.receiver_phone}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Address</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{shipment.address}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>COD amount</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>${shipment.cod_amount?.toFixed(2) ?? '0.00'}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Estimated delivery</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{shipment.estimated_delivery_days ?? 0} day(s)</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Notes</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Delivery notes"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    style={{ color: '#fff', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, minHeight: 84, textAlignVertical: 'top' }}
                    multiline
                  />
                </View>
              </View>
            </PremiumCard>

            <PremiumCard title="Actions" subtitle="Update shipment status" style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {actionStates.map((action) => (
                  <Pressable
                    key={action.key}
                    disabled={isUpdating}
                    onPress={() => handleStatusChange(action.key)}
                    style={{ flex: 1, backgroundColor: action.key === 'Delivered' ? '#34d399' : action.key === 'Cancelled' ? '#fb7185' : '#38bdf8', borderRadius: 18, paddingVertical: 14, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </PremiumCard>

            <PremiumCard title="Delivery timeline" subtitle="Shipment status history" style={{ marginTop: 12 }}>
              {timelineItems.length === 0 ? (
                <Text style={{ color: colors.textMuted }}>No history records yet.</Text>
              ) : (
                <View style={{ gap: 14 }}>
                  {timelineItems.map((item) => (
                    <View key={item.id} style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: '#38bdf8', marginTop: 6 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text>
                        <Text style={{ color: colors.textMuted, marginTop: 2 }}>{item.detail}</Text>
                        <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>{item.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </PremiumCard>

            <PremiumCard title="Proof of delivery" subtitle="Placeholder UI for signature, photo, and notes" style={{ marginTop: 12 }}>
              <View style={{ gap: 12 }}>
                <Pressable onPress={() => navigation.navigate('ProofOfDelivery', { shipment })} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Camera size={18} color="#38bdf8" />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Capture Photo</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('ProofOfDelivery', { shipment })} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Signature size={18} color="#38bdf8" />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Customer Signature</Text>
                  </View>
                </Pressable>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <FileText size={18} color="#38bdf8" />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Delivery Notes</Text>
                  </View>
                  <Text style={{ color: colors.textMuted, marginTop: 8 }}>Add any notes when you confirm proof of delivery.</Text>
                </View>
              </View>
            </PremiumCard>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
