import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'
import { CustomerNotification, getCustomerNotifications } from '../../services/notifications'

export function CustomerNotificationsScreen() {
  const [activeTab, setActiveTab] = useState<'All' | 'Updates' | 'Reminders' | 'Promotions'>('All')
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      setLoading(true)
      setError(null)

      try {
        const data = await getCustomerNotifications()
        if (active) {
          setNotifications(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load notifications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadNotifications()

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => notifications.filter((item) => {
    if (activeTab === 'All') {
      return true
    }

    const normalizedMessage = item.message.toLowerCase()

    if (activeTab === 'Updates') {
      return normalizedMessage.includes('shipment') || normalizedMessage.includes('delivery') || normalizedMessage.includes('update')
    }

    if (activeTab === 'Reminders') {
      return normalizedMessage.includes('reminder') || normalizedMessage.includes('tomorrow')
    }

    if (activeTab === 'Promotions') {
      return normalizedMessage.includes('promo') || normalizedMessage.includes('discount') || normalizedMessage.includes('offer')
    }

    return true
  }), [activeTab, notifications])

  const unreadCount = notifications.filter((item) => !item.is_read).length

  const formatTimestamp = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const getTitle = (item: CustomerNotification) => {
    const normalizedMessage = item.message.toLowerCase()

    if (normalizedMessage.includes('reminder')) {
      return 'Reminder'
    }

    if (normalizedMessage.includes('promo') || normalizedMessage.includes('discount') || normalizedMessage.includes('offer')) {
      return 'Promotion'
    }

    if (normalizedMessage.includes('shipment') || normalizedMessage.includes('delivery')) {
      return 'Shipment update'
    }

    return 'Notification'
  }

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
          {loading ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator color="#38bdf8" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Loading notifications…</Text>
            </View>
          ) : error ? (
            <Text style={{ color: '#fff', marginTop: 8 }}>{error}</Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 12, backgroundColor: item.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(56,189,248,0.12)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{getTitle(item)}</Text>
                    {!item.is_read ? <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#38bdf8' }} /> : null}
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{item.message}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>{formatTimestamp(item.created_at)}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{item.is_read ? 'Read' : 'Unread'}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 14 }}>No notifications in this category.</Text>}
            />
          )}
        </PremiumCard>
      </ScrollView>
    </LinearGradient>
  )
}
