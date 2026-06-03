import { apiClient, unwrap } from './client'
import type { BoardingPass } from '../types'

export const checkinApi = {
  checkIn: async (maVe: number): Promise<BoardingPass> => {
    const res = await apiClient.post('/checkin', { maVe })
    return unwrap<BoardingPass>(res)
  },

  getBoardingPass: async (maVe: number): Promise<BoardingPass> => {
    const res = await apiClient.get(`/checkin/${maVe}`)
    return unwrap<BoardingPass>(res)
  },

  getBoardingPassByCode: async (maVeCode: string): Promise<BoardingPass> => {
    const res = await apiClient.get(`/checkin/ticket-code/${encodeURIComponent(maVeCode)}`)
    return unwrap<BoardingPass>(res)
  },
}
