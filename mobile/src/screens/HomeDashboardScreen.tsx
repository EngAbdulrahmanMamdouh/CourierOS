import React from 'react'
import { ScrollView, View, Text, Pressable, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, ChevronRight, MapPinned, PackageCheck, Receipt, Sparkles, SunMedium, Truck, ArrowRight, ScanLine, CircleDollarSign } from 'lucide-react-native'
import { useAppTheme } from '../hooks/useTheme'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'

const kpis = [
  { title: 'Today\'s shipments', value: '12', subtitle: '3 urgent', icon: PackageCheck },
  { title: 'Completed', value: '8', subtitle: '+2 vs yesterday', icon: Truck },
  { title: 'Remaining', value: '4', subtitle: '1 scheduled', icon: ArrowRight },
  { title: 'COD to collect', value: '$860', subtitle: '2 payments due', icon: CircleDollarSign },
]

const recentActivities = [
  { title: 'Delivered to Marina Bay', time: '12 min ago', tone: 'success' },
  { title: 'Route optimized for Downtown Hub', time: '36 min ago', tone: 'info' },
  { title: 'Signature captured for parcel #2017', time: '1h ago', tone: 'success' },
]

export function HomeDashboardScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme()

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 }}>CourierOS driver</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Good morning, Omar</Text>
          </View>
          <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={18} color="#fff" />
          </Pressable>
        </View>

        <PremiumCard title="Current shift" subtitle="Connected · 08:30 to 17:30">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Route 12 · Downtown cluster</Text>
              <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>Live dispatch • 94% on-time target</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(52,211,153,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: '#34d399', fontWeight: '700' }}>Active</Text>
            </View>
          </View>
        </PremiumCard>

        <View style={{ marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {kpis.map((item, index) => {
            const Icon = item.icon
            return (
              <View key={index} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
                <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(56,189,248,0.16)', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon size={18} color="#38bdf8" />
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 }}>{item.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 12 }}>{item.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2, fontSize: 11 }}>{item.subtitle}</Text>
              </View>
            )
          })}
        </View>

        <PremiumCard title="Quick actions" subtitle="Accelerate the next handoff" style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {[
              { label: 'Scan package', icon: ScanLine, action: () => navigation.navigate('BarcodeScanner') },
              { label: 'Open map', icon: MapPinned, action: () => navigation.navigate('Map') },
              { label: 'Collect COD', icon: Receipt, action: () => navigation.navigate('ShipmentDetails') },
              { label: 'View history', icon: Sparkles, action: () => navigation.navigate('History') },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Pressable key={index} onPress={item.action} style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <Icon size={18} color="#38bdf8" />
                  <Text style={{ color: '#fff', fontWeight: '700', marginTop: 8 }}>{item.label}</Text>
                </Pressable>
              )
            })}
          </View>
        </PremiumCard>

        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Weather outlook" subtitle="Ambient conditions for today’s route" />
          <PremiumCard title="Mostly clear" subtitle="12°C · Light breeze · Excellent delivery conditions">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SunMedium size={18} color="#fbbf24" />
                <Text style={{ color: '#fff', fontWeight: '700' }}>Route comfort: High</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Ready for dispatch</Text>
            </View>
          </PremiumCard>
        </View>

        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Recent activity" subtitle="Latest movements across your day" />
          {recentActivities.map((item, index) => (
            <View key={index} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
