import { apiClient, unwrap } from './client'
import type { ConfigParam } from '../types'

export const configApi = {
  list: async (): Promise<ConfigParam[]> => {
    const res = await apiClient.get('/config')
    return unwrap<ConfigParam[]>(res)
  },

  get: async (key: string): Promise<ConfigParam> => {
    const res = await apiClient.get(`/config/${key}`)
    return unwrap<ConfigParam>(res)
  },

  update: async (key: string, giaTri: string): Promise<ConfigParam> => {
    const res = await apiClient.put(`/config/${key}`, { giaTri })
    return unwrap<ConfigParam>(res)
  },

  batchUpdate: async (thamSo: Record<string, string>): Promise<ConfigParam[]> => {
    const res = await apiClient.put('/config/batch', { thamSo })
    return unwrap<ConfigParam[]>(res)
  },
}
