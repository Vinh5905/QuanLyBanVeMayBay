import { apiClient, unwrap } from './client'
import type { AuthTokens, UserInfo } from '../types'

export const authApi = {
  login: async (tenDangNhap: string, matKhau: string): Promise<AuthTokens> => {
    const res = await apiClient.post('/auth/login', { tenDangNhap, matKhau })
    return unwrap(res)
  },

  register: async (data: {
    tenDangNhap: string
    matKhau: string
    email: string
    hoTen: string
    ngaySinh?: string
    soDienThoai?: string
    cccd?: string
  }): Promise<null> => {
    const res = await apiClient.post('/auth/register', data)
    return res.data.data
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {})
  },

  me: async (): Promise<UserInfo> => {
    const res = await apiClient.get('/auth/me')
    return unwrap(res)
  },

  changePassword: async (matKhauHienTai: string, matKhauMoi: string): Promise<void> => {
    await apiClient.put('/auth/change-password', { matKhauHienTai, matKhauMoi })
  },
}
