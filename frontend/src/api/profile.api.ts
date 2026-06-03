import { apiClient, unwrap } from './client'

export interface CustomerProfile {
  maKhachHang: number
  hoTen: string
  email: string
  soDienThoai?: string
  cccd?: string
  ngaySinh?: string
  diemTichLuy: number
  hangThanhVien?: string
  tenDangNhap: string
}

export interface UpdateProfileData {
  hoTen?: string
  soDienThoai?: string
  cccd?: string
  ngaySinh?: string
}

export const profileApi = {
  get: async (): Promise<CustomerProfile> => {
    const res = await apiClient.get('/profile')
    return unwrap(res)
  },

  update: async (data: UpdateProfileData): Promise<CustomerProfile> => {
    const res = await apiClient.put('/profile', data)
    return unwrap(res)
  },
}
