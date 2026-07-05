import React from 'react'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, BellRing, Clock3, Sparkles, Truck } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { useAppTheme } from '../hooks/useTheme'
import { notificationHandlers } from '../services/notifications'

const messages = [
  { id: '1', title: 'New shipment assigned', detail: 'Pick-up scheduled for 09:15', icon: Truck },
  { id: '2', title: 'Route update', detail: 'Traffic ahead on Jumeirah Road', icon: Sparkles },
  { id: '3', title: 'Pickup request', detail: 'Please confirm package collection', icon: BellRing },
]

export function NotificationsScreen() {
  const { colors } = useAppTheme()

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <SectionHeader title="Notifications" subtitle="Live dispatch updates for your shift" />

        <PremiumCard title="Recent alerts" subtitle="Tap to preview local notification behavior">
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const Icon = item.icon
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(56,189,248,0.12)', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon size={18} color="#38bdf8" />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{item.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{item.detail}</Text>
                  </View>
                </View>
              )
            }}
          />
        </PremiumCard>

        <PremiumCard title="Test notifications" subtitle="Preview the driver alert experience" style={{ marginTop: 12 }}>
          <View style={{ gap: 12 }}>
            <Pressable onPress={notificationHandlers.newAssignment} style={{ backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#38bdf8', fontWeight: '700' }}>New assignment preview</Text>
            </Pressable>
            <Pressable onPress={notificationHandlers.routeUpdate} style={{ backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#22c55e', fontWeight: '700' }}>Route update preview</Text>
            </Pressable>
            <Pressable onPress={notificationHandlers.pickupRequest} style={{ backgroundColor: 'rgba(251,113,133,0.12)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fb7185', fontWeight: '700' }}>Pickup request preview</Text>
            </Pressable>
          </View>
        </PremiumCard>

        <PremiumCard title="Notification settings" subtitle="Local alerts are active" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Driver dispatch alerts</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>On</Text>
            </View>
            <Bell size={24} color="#38bdf8" />
          </View>
        </PremiumCard>
      </ScrollView>
    </LinearGradient>
  )
}
