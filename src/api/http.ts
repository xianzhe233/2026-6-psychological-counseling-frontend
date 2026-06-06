import axios from 'axios'

import { clearAuthState } from '@/stores/auth'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,
})

http.interceptors.response.use(
  (response) => {
    const result = response.data as { code?: number; message?: string }
    if (typeof result?.code === 'number' && result.code !== 200) {
      if (result.code === 401) {
        clearAuthState()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject({
        response: {
          ...response,
          data: result,
          status: result.code,
        },
        message: result.message || '请求失败',
      })
    }
    return response
  },
  async (error) => {
    const status = error?.response?.status
    if (status === 401) {
      clearAuthState()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
