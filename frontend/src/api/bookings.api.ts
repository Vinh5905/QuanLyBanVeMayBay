import { apiClient, unwrap, unwrapList } from './client'
import type { Booking } from '../types'

export const bookingsApi = {
  create: async (data: { maChuyenBay: number; maHangVe: number }): Promise<Booking> => {
    const res = await apiClient.post('/bookings', data)
    return unwrap<Booking>(res)
  },

  list: async (params: { trangThaiVe?: string; page?: number; size?: number } = {}) => {
    const res = await apiClient.get('/bookings', { params })
    return unwrapList<Booking>(res)
  },

  myBookings: async (): Promise<Booking[]> => {
    const res = await apiClient.get('/bookings/my')
    return unwrap<Booking[]>(res)
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`)
  },
}
