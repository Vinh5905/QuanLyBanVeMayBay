import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token storage ─────────────────────────────────────────────────────────────
export const tokenStore = {
  getAccess: () => localStorage.getItem('accessToken'),
  getRefresh: () => localStorage.getItem('refreshToken'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  },
  clear: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  },
}

// ── Request interceptor – attach token ────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor – unwrap data, handle 401 ───────────────────────────
let refreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/register')
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      const refreshToken = tokenStore.getRefresh()
      if (!refreshToken) {
        tokenStore.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (refreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          })
        })
      }

      original._retry = true
      refreshing = true

      try {
        const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        )
        const { accessToken, refreshToken: newRefresh } = res.data.data!
        tokenStore.set(accessToken, newRefresh)
        refreshQueue.forEach((cb) => cb(accessToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch {
        tokenStore.clear()
        refreshQueue = []
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        refreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Helper: unwrap response data ──────────────────────────────────────────────
export function unwrap<T>(res: { data: ApiResponse<T> }): T {
  if (res.data.status === 'error') {
    throw new Error(res.data.message || 'Lỗi không xác định')
  }
  return res.data.data as T
}

export function unwrapList<T>(res: { data: ApiResponse<T[]> }): { data: T[]; pagination?: ApiResponse<T[]>['pagination'] } {
  if (res.data.status === 'error') {
    throw new Error(res.data.message || 'Lỗi không xác định')
  }
  return { data: res.data.data ?? [], pagination: res.data.pagination }
}
