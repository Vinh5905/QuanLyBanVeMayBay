import apiClient from './axios';
import type { BaggagePricingResponse, RegisterBaggageRequest, BaggageResponse } from '../types/baggage';
import type { ApiSingleResponse } from './adapter';

const BASE = '/baggage';

export const baggageApi = {
  getPricing: () =>
    apiClient.get<ApiSingleResponse<BaggagePricingResponse[]>>(`${BASE}/pricing`).then(r => r.data),

  register: (data: RegisterBaggageRequest) =>
    apiClient.post<ApiSingleResponse<BaggageResponse>>(BASE, data).then(r => r.data),

  getByTicket: (maVe: number) =>
    apiClient.get<ApiSingleResponse<BaggageResponse>>(`${BASE}/ticket/${maVe}`).then(r => r.data),

  cancelBaggage: (id: number) =>
    apiClient.delete<ApiSingleResponse<void>>(`${BASE}/${id}`).then(r => r.data),
};
