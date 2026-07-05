import React from 'react'
import { View, Text } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function HomeScreen() {
  const { colors } = useAppTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>CourierOS Driver Home</Text>
      <Text style={{ color: colors.textMuted, marginTop: 8 }}>The premium foundation is ready for the business screens.</Text>
    </View>
  )
}
