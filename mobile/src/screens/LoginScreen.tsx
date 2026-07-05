import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../store/auth'
import { saveToken } from '../utils/storage'
import api from '../services/api'

export function LoginScreen() {
  const { colors } = useAppTheme()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    if (!username || !password) {
      Alert.alert('Required', 'Enter your username and password.');
      return
    }

    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)

      const response = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const token = response.data.access_token
      await saveToken(token)
      setAuth({ id: 1, username, role: 'driver' }, token)
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#081120', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 30, padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>Welcome back</Text>
            <Text style={{ color: 'rgba(255,255,255,0.78)', marginTop: 8 }}>Secure access to your daily delivery workflow.</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoCapitalize="none"
              style={{ marginTop: 20, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              style={{ marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
            />

            <Pressable onPress={onSubmit} disabled={loading} style={{ marginTop: 18, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#38bdf8' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{loading ? 'Signing in...' : 'Sign in'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
