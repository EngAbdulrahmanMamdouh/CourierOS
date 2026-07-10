import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { AuthToken, AuthUser } from '../types'
import * as authService from '../services/auth'

const TOKEN_KEY = 'courieros.token'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY)
      if (!storedToken) {
        setLoading(false)
        return
      }

      setToken(storedToken)
      const profile = await authService.getProfile()
      setUser(profile)
    } catch (error) {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const signIn = useCallback(async (username: string, password: string) => {
    const tokenResponse = await authService.login(username, password)
    await SecureStore.setItemAsync(TOKEN_KEY, tokenResponse.access_token)
    setToken(tokenResponse.access_token)

    const profile = await authService.getProfile()
    setUser(profile)
  }, [])

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, signIn, signOut }),
    [user, token, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
