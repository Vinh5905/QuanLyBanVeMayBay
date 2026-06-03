import { apiClient, unwrap } from './client'
import type { DashboardSummary, Flight, Ticket } from '../types'

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get('/dashboard/summary')
    return unwrap<DashboardSummary>(res)
  },

  revenueChart: async (): Promise<{ ngay: string; doanhThu: number }[]> => {
    const res = await apiClient.get('/dashboard/charts/revenue')
    return unwrap<{ ngay: string; doanhThu: number }[]>(res)
  },

  ticketChart: async (): Promise<{ hangVe: string; soLuong: number; phanTram: number }[]> => {
    const res = await apiClient.get('/dashboard/charts/tickets')
    return unwrap<{ hangVe: string; soLuong: number; phanTram: number }[]>(res)
  },

  recentTickets: async (): Promise<Ticket[]> => {
    const res = await apiClient.get('/dashboard/recent/tickets')
    return unwrap<Ticket[]>(res)
  },

  todayFlights: async (): Promise<Flight[]> => {
    const res = await apiClient.get('/dashboard/today/flights')
    return unwrap<Flight[]>(res)
  },
}
