import { apiClient, unwrap } from './client'
import type { BaggagePricing, BaggagePackage } from '../types'

export const baggageApi = {
  pricing: async (): Promise<BaggagePricing[]> => {
    const res = await apiClient.get('/baggage/pricing')
    return unwrap<BaggagePricing[]>(res)
  },

  register: async (data: {
    maVe: number
    maBangGia: number
    danhSachKien: { trongLuong: number; ghiChu?: string }[]
  }): Promise<BaggagePackage> => {
    const res = await apiClient.post('/baggage', data)
    return unwrap<BaggagePackage>(res)
  },

  byTicket: async (maVe: number): Promise<BaggagePackage[]> => {
    const res = await apiClient.get(`/baggage/ticket/${maVe}`)
    return unwrap<BaggagePackage[]>(res)
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/baggage/${id}`)
  },
}
