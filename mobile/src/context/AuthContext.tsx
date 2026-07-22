import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthUser } from '../types'
import * as authService from '../services/auth'
import { clearToken, getToken, isJwtExpired, saveToken } from '../utils/storage'
import { emitAuthEvent, subscribeToAuthEvents } from '../utils/authEvents'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const restoreSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const storedToken = await getToken()
      if (!storedToken || isJwtExpired(storedToken)) {
        await clearToken()
        setUser(null)
        setToken(null)
        return
      }

      setToken(storedToken)
      const profile = await authService.getProfile()
      setUser(profile)
    } catch (error) {
      await clearToken()
      setUser(null)
      setToken(null)
      setError(error instanceof Error ? error.message : 'Your session expired. Please sign in again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents(() => {
      setUser(null)
      setToken(null)
      setLoading(false)
      setError('Your session expired. Please sign in again.')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const tokenResponse = await authService.login(username, password)
      const nextToken = tokenResponse.access_token
      await saveToken(nextToken)
      setToken(nextToken)

      const profile = await authService.getProfile()
      setUser(profile)
    } catch (error) {
      await clearToken()
      setUser(null)
      setToken(null)
      const nextError = error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
      setError(nextError)
      throw new Error(nextError)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await clearToken()
      emitAuthEvent()
    } finally {
      setUser(null)
      setToken(null)
      setLoading(false)
      setError(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, error, signIn, signOut }),
    [user, token, loading, error, signIn, signOut],
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
