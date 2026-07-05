import axios, { AxiosError, AxiosInstance } from 'axios'
import { getToken } from '../utils/storage'

const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data
      ? String((error.response.data as { detail?: unknown }).detail)
      : error.message

    return Promise.reject(new Error(message))
  },
)

export default api
