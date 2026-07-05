import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Clock3, MapPinned, Navigation2 } from 'lucide-react-native'
import { useAppTheme } from '../../hooks/useTheme'
import { PremiumCard } from '../../components/PremiumCard'
import { SectionHeader } from '../../components/SectionHeader'

export function LiveTrackingScreen() {
  const { colors } = useAppTheme()

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <SectionHeader title="Live tracking" subtitle="Driver location and ETA" />

        <PremiumCard title="Route preview" subtitle="Google Maps ready">
          <View style={{ height: 240, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' }}>
            <MapPinned size={40} color="#38bdf8" />
            <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>Route map placeholder</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>Maps integration is ready for runtime wiring.</Text>
          </View>
        </PremiumCard>

        <PremiumCard title="Driver location" subtitle="Last known position">
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Your driver is approaching the destination.</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Current placeholder location: Near city center.</Text>
          </View>
        </PremiumCard>

        <PremiumCard title="Estimated arrival" subtitle="Expected delivery window" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>ETA</Text>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 6 }}>09:22</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(56,189,248,0.16)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: '#38bdf8', fontWeight: '700' }}>On time</Text>
            </View>
          </View>
        </PremiumCard>

        <Pressable onPress={() => {}} style={{ marginTop: 18, backgroundColor: '#38bdf8', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Open navigation app</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  )
}
