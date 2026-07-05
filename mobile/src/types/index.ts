export type ThemeMode = 'light' | 'dark'

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface AuthUser {
  id: number
  username: string
  full_name?: string
  role?: string
  company_id?: number
}

export interface AppSettings {
  theme: ThemeMode
  offlineMode: boolean
}
