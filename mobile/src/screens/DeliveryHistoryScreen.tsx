import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, FileText } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { getAssignedShipments } from '../services/shipment'
import { ShipmentDetail } from '../types'

export function DeliveryHistoryScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState('')
  const [shipments, setShipments] = useState<ShipmentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadHistory() {
      setLoading(true)
      setError(null)

      try {
        const data = await getAssignedShipments(1, 50, 'Delivered', query || undefined)
        if (active) {
          setShipments(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load delivery history.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [query])

  const filtered = useMemo(() => shipments.filter((item) => `${item.id} ${item.receiver_name} ${item.city} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [query, shipments])

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

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#38bdf8" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Loading delivery history…</Text>
          </View>
        ) : error ? (
          <PremiumCard title="Unable to load deliveries" subtitle={error} style={{ marginTop: 12 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 48 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ShipmentDetails', { shipmentId: item.id, shipment: item })} style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{item.receiver_name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.tracking_number ?? `#${item.id}`}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(52,211,153,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ color: '#34d399', fontWeight: '700' }}>{item.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock3 size={14} color="rgba(255,255,255,0.65)" />
                    <Text style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>{item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Updated'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileText size={14} color="rgba(255,255,255,0.65)" />
                    <Text style={{ color: 'rgba(255,255,255.0.65)', marginLeft: 6 }}>{item.cod_amount !== undefined ? `$${item.cod_amount.toFixed(2)}` : 'No COD'}</Text>
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <PremiumCard title="No matching deliveries" subtitle="Try a different search term." style={{ marginTop: 12 }} />
            }
          />
        )}
      </View>
    </LinearGradient>
  )
}
