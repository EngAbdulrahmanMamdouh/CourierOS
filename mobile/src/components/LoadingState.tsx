import React from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function LoadingState({ message = 'Preparing your workspace…' }: { message?: string }) {
  const { colors } = useAppTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontWeight: '600' }}>{message}</Text>
    </View>
  )
}
