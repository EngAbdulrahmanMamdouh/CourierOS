import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, MapPinned, Navigation2 } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'

export function MapScreen({ navigation }: { navigation: any }) {
  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Back</Text>
        </Pressable>

        <PremiumCard title="Live route map" subtitle="Google Maps, Waze, and Apple Maps ready">
          <View style={{ height: 260, marginTop: 12, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.10)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <MapPinned size={40} color="#38bdf8" />
            <Text style={{ color: '#fff', fontWeight: '700', marginTop: 8 }}>Route preview surface</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Maps integration points are prepared for SDK wiring.</Text>
          </View>
        </PremiumCard>

        <PremiumCard title="Navigate" subtitle="Open preferred navigation app" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {['Google Maps', 'Waze', 'Apple Maps'].map((item) => (
              <Pressable key={item} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                <Navigation2 size={18} color="#38bdf8" />
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 6 }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </PremiumCard>
      </View>
    </LinearGradient>
  )
}
