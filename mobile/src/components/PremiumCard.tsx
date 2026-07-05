import React from 'react'
import { View, Text, type ViewStyle, type StyleProp } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function PremiumCard({ title, subtitle, children, style }: { title: string; subtitle?: string; children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme()

  return (
    <View style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 16 }, style]}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted, marginTop: 4 }}>{subtitle}</Text> : null}
      {children ? <View style={{ marginTop: 12 }}>{children}</View> : null}
    </View>
  )
}
