import axios, { AxiosError, AxiosInstance } from 'axios'
import { clearToken, getToken, isJwtExpired } from '../utils/storage'
import { emitAuthEvent } from '../utils/authEvents'

const api: AxiosInstance = axios.create({
  baseURL: 'http://10.242.180.191:8000',
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token && !isJwtExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token) {
    await clearToken()
    emitAuthEvent()
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      await clearToken()
      emitAuthEvent()
    }

    const message = error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data
      ? String((error.response.data as { detail?: unknown }).detail)
      : error.message

    return Promise.reject(new Error(message))
  },
)

export default api
