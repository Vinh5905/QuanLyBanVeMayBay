import apiClient from './axios';
import type { TicketResponse, SellTicketRequest, ChangeFlightRequest, UpgradeRequest, TicketSearchParams } from '../types/ticket';
import type { ApiListResponse, ApiSingleResponse } from './adapter';

const BASE = '/tickets';

export const ticketApi = {
  getTickets: (params?: TicketSearchParams) =>
    apiClient.get<ApiListResponse<TicketResponse>>(BASE, { params }).then(r => r.data),

  getTicketById: (id: number) =>
    apiClient.get<ApiSingleResponse<TicketResponse>>(`${BASE}/${id}`).then(r => r.data),

  sellTicket: (data: SellTicketRequest) =>
    apiClient.post<ApiSingleResponse<TicketResponse>>(`${BASE}/sell`, data).then(r => r.data),

  changeFlight: (id: number, data: ChangeFlightRequest) =>
    apiClient.put<ApiSingleResponse<TicketResponse>>(`${BASE}/${id}/change-flight`, data).then(r => r.data),

  upgrade: (id: number, data: UpgradeRequest) =>
    apiClient.put<ApiSingleResponse<TicketResponse>>(`${BASE}/${id}/upgrade`, data).then(r => r.data),

  cancelTicket: (id: number) =>
    apiClient.delete<ApiSingleResponse<void>>(`${BASE}/${id}`).then(r => r.data),

  getMyTickets: () =>
    apiClient.get<ApiListResponse<TicketResponse>>(`${BASE}/my`).then(r => r.data),
};
