import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { MapPinned, Phone, Package } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { ShipmentDetail } from '../types'
import { StatusBadge } from './StatusBadge'

export function ShipmentCard({ shipment, onPress }: { shipment: ShipmentDetail; onPress?: () => void }) {
  const { colors } = useAppTheme()

  return (
    <Pressable onPress={onPress} style={{ marginBottom: 12, backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{shipment.tracking_number || `#${shipment.id}`}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>{shipment.receiver_name}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>{shipment.city}</Text>
        </View>
        <StatusBadge status={shipment.status} />
      </View>
      <View style={{ marginTop: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Phone size={14} color={colors.primary} />
          <Text style={{ color: colors.text }}>{shipment.receiver_phone}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MapPinned size={14} color={colors.primary} />
          <Text style={{ color: colors.text }}>{shipment.address}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Package size={14} color={colors.primary} />
          <Text style={{ color: colors.text }}>{shipment.cod_amount ? `$${shipment.cod_amount.toFixed(2)}` : 'No COD'}</Text>
        </View>
      </View>
    </Pressable>
  )
}
