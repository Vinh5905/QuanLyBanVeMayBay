import { apiClient, unwrap, unwrapList } from './client'
import type { Ticket } from '../types'

export const ticketsApi = {
  list: async (params: {
    maKhachHang?: number
    maChuyenBay?: number
    trangThaiVe?: string
    page?: number
    size?: number
    sort?: string
  } = {}) => {
    const res = await apiClient.get('/tickets', { params })
    return unwrapList<Ticket>(res)
  },

  myTickets: async (): Promise<Ticket[]> => {
    const res = await apiClient.get('/tickets/my')
    return unwrap<Ticket[]>(res)
  },

  get: async (id: number): Promise<Ticket> => {
    const res = await apiClient.get(`/tickets/${id}`)
    return unwrap<Ticket>(res)
  },

  sell: async (data: { maChuyenBay: number; maKhachHang: number; maHangVe: number }): Promise<Ticket> => {
    const res = await apiClient.post('/tickets/sell', data)
    return unwrap<Ticket>(res)
  },

  changeFlight: async (id: number, maChuyenBayMoi: number): Promise<Ticket> => {
    const res = await apiClient.put(`/tickets/${id}/change-flight`, { maChuyenBayMoi })
    return unwrap<Ticket>(res)
  },

  upgrade: async (id: number, maHangVeMoi: number): Promise<Ticket> => {
    const res = await apiClient.put(`/tickets/${id}/upgrade`, { maHangVeMoi })
    return unwrap<Ticket>(res)
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`)
  },
}
