import { create } from 'zustand'

interface OfflineState {
  isOffline: boolean
  setOffline: (value: boolean) => void
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOffline: false,
  setOffline: (value) => set({ isOffline: value }),
}))
