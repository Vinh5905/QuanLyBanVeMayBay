import { apiClient, unwrap, unwrapList } from './client'
import type { Payment, PaymentMethod } from '../types'

export const paymentsApi = {
  create: async (data: {
    maPhieuDatCho?: number
    maVe?: number
    hinhThucThanhToan: PaymentMethod
    soTienThanhToan: number
    maGiaoDich?: string
    loaiThanhToan?: 'TICKET' | 'BAGGAGE' | 'UPGRADE' | 'SERVICE'
    maGoiHanhLyList?: number[]
    maHangVeMoi?: number
  }): Promise<Payment> => {
    const res = await apiClient.post('/payments', data)
    return unwrap<Payment>(res)
  },

  get: async (id: number): Promise<Payment> => {
    const res = await apiClient.get(`/payments/${id}`)
    return unwrap<Payment>(res)
  },

  list: async (params: { maVe?: number; trangThai?: string; page?: number; size?: number } = {}) => {
    const res = await apiClient.get('/payments', { params })
    return unwrapList<Payment>(res)
  },
}
