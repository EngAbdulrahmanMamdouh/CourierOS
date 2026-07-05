import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '../../hooks/useTheme'
import api from '../../services/api'

export function RegisterCustomerScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName || !email || !username || !password) {
      Alert.alert('Missing fields', 'Please complete all fields to continue.')
      return
    }

    setLoading(true)
    try {
      await api.post('/users/register', {
        full_name: fullName,
        email,
        username,
        password,
      })
      Alert.alert('Registration complete', 'Your account has been created. Please log in.')
      navigation.navigate('Login')
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Unable to register.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#081120', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900' }}>Create your account</Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', marginTop: 10 }}>Sign up to track shipments, request pickup, and receive delivery alerts.</Text>

          <View style={{ marginTop: 24, gap: 14 }}>
            {[
              { label: 'Full name', value: fullName, setter: setFullName },
              { label: 'Email', value: email, setter: setEmail, keyboardType: 'email-address' as const },
              { label: 'Username', value: username, setter: setUsername },
              { label: 'Password', value: password, setter: setPassword, secureTextEntry: true as const },
            ].map((field) => (
              <TextInput
                key={field.label}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.label}
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry={field.secureTextEntry}
                keyboardType={field.keyboardType ?? 'default'}
                style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
              />
            ))}
          </View>

          <Pressable onPress={handleRegister} disabled={loading} style={{ marginTop: 24, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#38bdf8' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{loading ? 'Creating account…' : 'Create account'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
