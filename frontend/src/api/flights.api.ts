import { apiClient, unwrap, unwrapList } from './client'
import type { Flight, Airport } from '../types'

export interface FlightSearchParams {
  sanBayDi?: string
  sanBayDen?: string
  ngayBay?: string
  trangThai?: string
  page?: number
  size?: number
  sort?: string
}

export const flightsApi = {
  list: async (params: FlightSearchParams = {}) => {
    const res = await apiClient.get('/flights', { params })
    return unwrapList<Flight>(res)
  },

  search: async (params: { sanBayDi?: string; sanBayDen?: string; ngayBay?: string }) => {
    const res = await apiClient.get('/flights/search', { params })
    return unwrap<Flight[]>(res)
  },

  airports: async (): Promise<Airport[]> => {
    const res = await apiClient.get('/flights/airports')
    return unwrap<Airport[]>(res)
  },

  get: async (id: number): Promise<Flight> => {
    const res = await apiClient.get(`/flights/${id}`)
    return unwrap<Flight>(res)
  },

  create: async (data: {
    maChuyenBayCode: string
    sanBayDi: string
    sanBayDen: string
    ngayGioBay: string
    thoiGianBay: number
    giaCoBan: number
    danhSachHangVe: { maHangVe: number; soLuong: number; donGia: number }[]
    danhSachTrungGian?: { maSanBay: string; thoiGianDung: number; ghiChu?: string }[]
  }): Promise<Flight> => {
    const res = await apiClient.post('/flights', data)
    return unwrap<Flight>(res)
  },

  update: async (id: number, data: Partial<{
    ngayGioBay: string
    thoiGianBay: number
    giaCoBan: number
    danhSachHangVe: { maHangVe: number; soLuong: number; donGia: number }[]
  }>): Promise<Flight> => {
    const res = await apiClient.put(`/flights/${id}`, data)
    return unwrap<Flight>(res)
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/flights/${id}`)
  },
}
