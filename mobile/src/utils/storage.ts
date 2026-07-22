import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'courieros.token'

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(normalized)
  }

  return atob(normalized)
}

export function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }

    const decoded = decodeBase64Url(payload)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isJwtExpired(token: string | null | undefined) {
  if (!token) {
    return true
  }

  const payload = decodeJwtPayload(token)
  if (!payload?.exp) {
    return false
  }

  return Date.now() >= Number(payload.exp) * 1000
}

export function isTokenUsable(token: string | null | undefined) {
  return Boolean(token) && !isJwtExpired(token)
}
