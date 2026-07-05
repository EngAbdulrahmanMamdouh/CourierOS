import React from 'react'
import { View, Text, type StyleProp, type ViewStyle } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function SectionHeader({ title, subtitle, style }: { title: string; subtitle?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme()

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 13 }}>{subtitle}</Text> : null}
    </View>
  )
}
