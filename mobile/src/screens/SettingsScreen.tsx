import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../hooks/useTheme'

export function SettingsScreen() {
  const { colors } = useAppTheme()
  const { user, signOut } = useAuth()

  async function handleLogout() {
    await signOut()
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Settings</Text>
      {user ? (
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>{user.username}</Text>
      ) : null}
      <Pressable onPress={handleLogout} style={{ marginTop: 20, backgroundColor: colors.danger, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Logout</Text>
      </Pressable>
    </View>
  )
}
