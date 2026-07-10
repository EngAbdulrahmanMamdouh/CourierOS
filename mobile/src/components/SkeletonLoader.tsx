import React from 'react'
import { View, Animated } from 'react-native'
import { useAppTheme } from '../hooks/useTheme'

export function SkeletonLoader({ height = 14, width = '100%', style }: { height?: number; width?: number | string; style?: any }) {
  const { colors } = useAppTheme()
  return (
    <Animated.View style={[{ height, width, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, marginVertical: 6 }, style]} />
  )
}
