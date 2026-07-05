import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, CalendarCheck, Sparkles, Tag } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

const notifications = [
  { id: '1', title: 'Shipment SHP-2098 is on the way', category: 'Update', unread: true },
  { id: '2', title: 'Delivery reminder tomorrow', category: 'Reminder', unread: true },
  { id: '3', title: 'Premium service discount available', category: 'Promotion', unread: false },
]

export function CustomerNotificationsScreen() {
  const { colors } = useAppTheme()
  const [activeTab, setActiveTab] = useState<'All' | 'Updates' | 'Reminders' | 'Promotions'>('All')

  const filtered = useMemo(
    () => notifications.filter((item) => activeTab === 'All' || item.category === activeTab),
    [activeTab],
  )

  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <SectionHeader title="Notifications" subtitle="Shipment updates and promotions" />
          <View style={{ backgroundColor: '#38bdf8', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{unreadCount} unread</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          {(['All', 'Updates', 'Reminders', 'Promotions'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: activeTab === tab ? '#38bdf8' : 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: '700' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <PremiumCard title="Inbox" subtitle="Stay on top of your deliveries">
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12, backgroundColor: item.unread ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{item.category}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 14 }}>No notifications in this category.</Text>}
          />
        </PremiumCard>
      </ScrollView>
    </LinearGradient>
  )
}
