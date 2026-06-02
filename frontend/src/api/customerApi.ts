import apiClient from './axios'
import type { CustomerResponse, CreateCustomerRequest } from '../types/customer'
import type { ApiSingleResponse, ApiListResponse } from './adapter'

const BASE = '/customers'

export const customerApi = {
  searchByCccd: (cccd: string) =>
    apiClient.get<ApiListResponse<CustomerResponse>>(`${BASE}/search`, { params: { cccd } }).then(r => r.data),

  createCustomer: (data: CreateCustomerRequest) =>
    apiClient.post<ApiSingleResponse<CustomerResponse>>(BASE, data).then(r => r.data),
}
