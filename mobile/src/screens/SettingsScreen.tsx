import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAuthStore } from '../store/auth'
import { clearToken } from '../utils/storage'
import { useAppTheme } from '../hooks/useTheme'

export function SettingsScreen() {
  const { colors } = useAppTheme()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  async function handleLogout() {
    await clearToken()
    clearAuth()
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Settings</Text>
      <Pressable onPress={handleLogout} style={{ marginTop: 20, backgroundColor: colors.danger, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Logout</Text>
      </Pressable>
    </View>
  )
}
