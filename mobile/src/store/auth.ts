import { create } from 'zustand'
import { AuthUser } from '../types'
import { clearToken, getToken, isJwtExpired, saveToken } from '../utils/storage'
import { emitAuthEvent } from '../utils/authEvents'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  setAuth: (user: AuthUser | null, token: string | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  initializeAuth: () => Promise<void>
  persistAuth: (token: string, user?: AuthUser | null) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  setAuth: (user, token) => set({ user, token }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => {
    set({ user: null, token: null })
    emitAuthEvent()
  },
  initializeAuth: async () => {
    set({ loading: true })
    try {
      const storedToken = await getToken()
      if (!storedToken || isJwtExpired(storedToken)) {
        await clearToken()
        set({ user: null, token: null })
        return
      }

      set({ token: storedToken })
    } catch {
      await clearToken()
      set({ user: null, token: null })
    } finally {
      set({ loading: false })
    }
  },
  persistAuth: async (token, user = null) => {
    await saveToken(token)
    set({ token, user })
  },
}))

export async function hydrateCustomerAuth() {
  await useAuthStore.getState().initializeAuth()
}
