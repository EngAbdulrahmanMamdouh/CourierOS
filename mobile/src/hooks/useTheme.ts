import { useColorScheme } from 'react-native'
import { useMemo } from 'react'
import { colors } from '../theme'

export function useAppTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  return useMemo(() => ({
    isDark,
    colors: {
      ...colors,
      background: isDark ? colors.background : '#f8fafc',
      text: isDark ? colors.text : '#0f172a',
      textMuted: isDark ? colors.textMuted : '#475569',
      surface: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255,255,255,0.7)',
      border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
    },
  }), [isDark])
}
