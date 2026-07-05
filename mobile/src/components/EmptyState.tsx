import React from 'react'
import { View, Text } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function EmptyState({ title, description }: { title: string; description?: string }) {
  const { colors } = useAppTheme()

  return (
    <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
      <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
        {description ? <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>{description}</Text> : null}
      </View>
    </View>
  )
}
