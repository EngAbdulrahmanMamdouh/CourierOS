import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useAppTheme()

  return (
    <View style={{ padding: 24 }}>
      <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Something went wrong</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>{message}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
