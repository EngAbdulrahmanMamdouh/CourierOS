import { create } from 'zustand'
import { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  setAuth: (user: AuthUser | null, token: string | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  setAuth: (user, token) => set({ user, token }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, token: null }),
}))
