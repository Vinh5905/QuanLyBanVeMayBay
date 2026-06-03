import { apiClient, unwrap, unwrapList } from './client'
import type { Account } from '../types'

export const accountsApi = {
  list: async (params: { vaiTro?: string; trangThai?: number; keyword?: string; page?: number; size?: number } = {}) => {
    const res = await apiClient.get('/accounts', { params })
    return unwrapList<Account>(res)
  },

  get: async (id: number): Promise<Account> => {
    const res = await apiClient.get(`/accounts/${id}`)
    return unwrap<Account>(res)
  },

  create: async (data: { tenDangNhap: string; matKhau: string; email: string; vaiTro: string }): Promise<Account> => {
    const res = await apiClient.post('/accounts', data)
    return unwrap<Account>(res)
  },

  update: async (id: number, data: { email?: string; tenDangNhap?: string }): Promise<Account> => {
    const res = await apiClient.put(`/accounts/${id}`, data)
    return unwrap<Account>(res)
  },

  setStatus: async (id: number, active: boolean): Promise<void> => {
    await apiClient.put(`/accounts/${id}/status`, null, { params: { active } })
  },

  resetPassword: async (id: number, matKhauMoi: string): Promise<void> => {
    await apiClient.put(`/accounts/${id}/reset-password`, { matKhauMoi })
  },
}
