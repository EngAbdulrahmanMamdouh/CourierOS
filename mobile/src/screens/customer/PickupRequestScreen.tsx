import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '../../hooks/useTheme'
import api from '../../services/api'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

export function PickupRequestScreen() {
  const { colors } = useAppTheme()
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [preferredPickupDate, setPreferredPickupDate] = useState('')
  const [notes, setNotes] = useState('Pickup from home after 5 PM')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!address || !contactName || !contactPhone || !preferredPickupDate) {
      Alert.alert('Missing information', 'Please fill in the pickup request details.')
      return
    }

    setLoading(true)
    try {
      await api.post('/pickup-requests', {
        pickup_address: address,
        contact_name: contactName,
        contact_phone: contactPhone,
        preferred_pickup_date: preferredPickupDate,
        preferred_time_window: '16:00-18:00',
        notes,
      })
      Alert.alert('Request submitted', 'Your pickup request has been created successfully.')
      setAddress('')
      setContactName('')
      setContactPhone('')
      setPreferredPickupDate('')
      setNotes('')
    } catch (error) {
      Alert.alert('Unable to submit', error instanceof Error ? error.message : 'Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          <SectionHeader title="Pickup request" subtitle="Schedule a doorstep pickup" />

          <PremiumCard title="Pickup details" subtitle="Tell us when and where">
            <View style={{ gap: 12 }}>
              <TextInput value={address} onChangeText={setAddress} placeholder="Pickup address" placeholderTextColor="rgba(255,255,255,0.5)" style={{ color: '#fff', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <TextInput value={contactName} onChangeText={setContactName} placeholder="Contact name" placeholderTextColor="rgba(255,255,255,0.5)" style={{ color: '#fff', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <TextInput value={contactPhone} onChangeText={setContactPhone} placeholder="Contact phone" placeholderTextColor="rgba(255,255,255,0.5)" keyboardType="phone-pad" style={{ color: '#fff', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <TextInput value={preferredPickupDate} onChangeText={setPreferredPickupDate} placeholder="Preferred pickup date" placeholderTextColor="rgba(255,255,255,0.5)" style={{ color: '#fff', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <TextInput value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor="rgba(255,255,255,0.5)" multiline numberOfLines={4} style={{ color: '#fff', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', minHeight: 100, textAlignVertical: 'top' }} />
            </View>
          </PremiumCard>

          <Pressable onPress={handleSubmit} disabled={loading} style={{ marginTop: 20, backgroundColor: '#34d399', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? 'Submitting…' : 'Submit pickup request'}</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}
