import { apiClient, unwrapList } from './client'
import type { Customer } from '../types'

export const customersApi = {
  list: async (params: { keyword?: string; page?: number; size?: number } = {}) => {
    const res = await apiClient.get('/customers', { params })
    return unwrapList<Customer>(res)
  },
}
