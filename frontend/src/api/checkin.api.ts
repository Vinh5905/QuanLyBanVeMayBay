import { apiClient, unwrap } from './client'
import type { BoardingPass } from '../types'

export const checkinApi = {
  checkIn: async (maVe: number, soGhe: string): Promise<BoardingPass> => {
    const res = await apiClient.post('/checkin', { maVe, soGhe })
    return unwrap<BoardingPass>(res)
  },

  getBoardingPass: async (maVe: number): Promise<BoardingPass> => {
    const res = await apiClient.get(`/checkin/${maVe}`)
    return unwrap<BoardingPass>(res)
  },
}
