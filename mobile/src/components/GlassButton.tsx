import React from 'react'
import { Pressable, Text } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function GlassButton({ title, onPress, variant = 'primary' }: { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' }) {
  const { colors } = useAppTheme()
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: variant === 'primary' ? colors.primary : 'rgba(255,255,255,0.10)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
      <Text style={{ color: variant === 'primary' ? '#fff' : colors.text, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
    </Pressable>
  )
}
