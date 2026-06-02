import apiClient from './axios';
import type { MonthlyReportRow, YearlyReportRow, ReportParams } from '../types/report';
import type { ApiListResponse } from './adapter';

const BASE = '/reports';

export const reportApi = {
  getMonthly: (params: ReportParams) =>
    apiClient.get<ApiListResponse<MonthlyReportRow>>(`${BASE}/monthly`, { params }).then(r => r.data),

  getYearly: (params: ReportParams) =>
    apiClient.get<ApiListResponse<YearlyReportRow>>(`${BASE}/yearly`, { params }).then(r => r.data),

  exportExcel: (params: ReportParams) =>
    apiClient.get(`${BASE}/export`, { params, responseType: 'blob' }).then(r => r.data),
};
