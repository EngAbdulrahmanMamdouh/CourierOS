type AuthListener = () => void

const listeners = new Set<AuthListener>()

export function subscribeToAuthEvents(listener: AuthListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitAuthEvent() {
  listeners.forEach((listener) => listener())
}
