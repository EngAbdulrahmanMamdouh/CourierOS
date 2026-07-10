import api from './api'
import { AuthToken, AuthUser } from '../types'

export async function login(username: string, password: string): Promise<AuthToken> {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)

  const response = await api.post<AuthToken>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return response.data
}

export async function getProfile(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/users/me')
  return response.data
}

export default { login, getProfile }
