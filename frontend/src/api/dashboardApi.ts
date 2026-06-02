import apiClient from './axios';
import type { DashboardSummary, RevenueChartData, TicketClassChartData } from '../types/dashboard';
import type { ApiSingleResponse } from './adapter';

const BASE = '/dashboard';

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<ApiSingleResponse<DashboardSummary>>(`${BASE}/summary`).then(r => r.data),

  getRevenueChart: () =>
    apiClient.get<ApiSingleResponse<RevenueChartData[]>>(`${BASE}/charts/revenue`).then(r => r.data),

  getTicketChart: () =>
    apiClient.get<ApiSingleResponse<TicketClassChartData[]>>(`${BASE}/charts/tickets`).then(r => r.data),

  getRecentTickets: () =>
    apiClient.get<ApiSingleResponse<any[]>>(`${BASE}/recent/tickets`).then(r => r.data),

  getTodayFlights: () =>
    apiClient.get<ApiSingleResponse<any[]>>(`${BASE}/today/flights`).then(r => r.data),
};
