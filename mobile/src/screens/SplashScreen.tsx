import React, { useEffect } from 'react'
import { View, Text, StatusBar } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'
import { LinearGradient } from 'expo-linear-gradient'

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { colors } = useAppTheme()

  useEffect(() => {
    const timer = setTimeout(onFinish, 1400)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <LinearGradient colors={['#0f172a', '#0f766e', '#38bdf8']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>CourierOS</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>Driver Mobile App</Text>
        </View>
      </View>
    </LinearGradient>
  )
}
