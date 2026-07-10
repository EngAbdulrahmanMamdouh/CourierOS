import React from 'react'
import { View, Text } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

const statusColors: Record<string, string> = {
  Pending: '#facc15',
  'In Transit': '#38bdf8',
  Delivered: '#34d399',
  Cancelled: '#fb7185',
}

export function StatusBadge({ status }: { status: string }) {
  const { colors } = useAppTheme()
  const color = statusColors[status] ?? colors.primary

  return (
    <View style={{ backgroundColor: `${color}22`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: `${color}33` }}>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{status}</Text>
    </View>
  )
}
