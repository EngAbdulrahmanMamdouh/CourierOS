import React, { useEffect } from 'react'
import { StatusBar, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppTheme } from '../../hooks/useTheme'

export function CustomerSplashScreen({ onFinish }: { onFinish: () => void }) {
  const { colors } = useAppTheme()

  useEffect(() => {
    const timer = setTimeout(onFinish, 1400)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <LinearGradient colors={[colors.background, '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: 28, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' }}>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900' }}>CourierOS</Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', marginTop: 10, fontSize: 16, textAlign: 'center' }}>Customer mobile portal for premium shipment tracking.</Text>
        </View>
      </View>
    </LinearGradient>
  )
}
