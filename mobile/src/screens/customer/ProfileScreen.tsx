import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '../../hooks/useTheme'
import { useAuthStore } from '../../store/auth'
import { clearToken } from '../../utils/storage'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'
import { getProfile } from '../../services/auth'

interface ProfileSummary {
  name: string
  email: string
  phone: string
  company: string
  address: string
  accountStatus: string
}

export function ProfileScreen() {
  const { isDark } = useAppTheme()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const storedUser = useAuthStore((state) => state.user)
  const [language, setLanguage] = useState('English')
  const [darkMode, setDarkMode] = useState(isDark)
  const [profile, setProfile] = useState<ProfileSummary>({
    name: storedUser?.username ?? 'Unavailable',
    email: storedUser?.email ?? 'Unavailable',
    phone: 'Not available from current backend',
    company: storedUser?.company_id ? `Company ID ${storedUser.company_id}` : 'Not available from current backend',
    address: 'Not available from current backend',
    accountStatus: storedUser?.role ? storedUser.role : 'Active',
  })
  const [loading, setLoading] = useState(!storedUser)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError(null)

      try {
        const data = await getProfile()
        if (active) {
          setProfile({
            name: data.username ?? 'Unavailable',
            email: data.email ?? 'Unavailable',
            phone: 'Not available from current backend',
            company: data.company_id ? `Company ID ${data.company_id}` : 'Not available from current backend',
            address: 'Not available from current backend',
            accountStatus: data.role ? data.role : 'Active',
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load profile.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  const profileFields = useMemo(() => [
    { label: 'Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'Company', value: profile.company },
    { label: 'Address', value: profile.address },
    { label: 'Account status', value: profile.accountStatus },
  ], [profile])

  const handleLogout = async () => {
    await clearToken()
    clearAuth()
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <SectionHeader title="Profile" subtitle="Account preferences" />

        <PremiumCard title="Customer" subtitle="Account details">
          {loading ? (
            <View style={{ marginTop: 10, alignItems: 'center', paddingVertical: 12 }}>
              <ActivityIndicator color="#38bdf8" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Loading profile…</Text>
            </View>
          ) : error ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{error}</Text>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              {profileFields.map((field) => (
                <View key={field.label} style={{ marginBottom: 10 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{field.label}</Text>
                  <Text style={{ color: '#fff', marginTop: 4, fontWeight: '700' }}>{field.value}</Text>
                </View>
              ))}
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>Profile editing is currently read-only because the available backend profile endpoint is read-only.</Text>
            </View>
          )}
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
