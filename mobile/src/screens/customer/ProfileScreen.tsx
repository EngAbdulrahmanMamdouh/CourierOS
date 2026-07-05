import React, { useState } from 'react'
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '../../hooks/useTheme'
import { useAuthStore } from '../../store/auth'
import { clearToken } from '../../utils/storage'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

export function ProfileScreen() {
  const { colors, isDark } = useAppTheme()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [language, setLanguage] = useState('English')
  const [darkMode, setDarkMode] = useState(isDark)

  const handleLogout = async () => {
    await clearToken()
    clearAuth()
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <SectionHeader title="Profile" subtitle="Account preferences" />

        <PremiumCard title="Customer" subtitle="Account details">
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Omar Al Farsi</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>omar@example.com</Text>
          </View>
        </PremiumCard>

        <PremiumCard title="Settings" subtitle="Customize your experience" style={{ marginTop: 12 }}>
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Dark mode</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Use a premium dark interface.</Text>
              </View>
              <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? '#34d399' : '#fff'} trackColor={{ false: '#6b7280', true: '#4ade80' }} />
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Language</Text>
              <TextInput value={language} onChangeText={setLanguage} placeholder="Language" placeholderTextColor="rgba(255,255,255,0.5)" style={{ marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
            </View>
          </View>
        </PremiumCard>

        <Pressable onPress={handleLogout} style={{ marginTop: 20, backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Logout</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  )
}
