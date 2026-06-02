import apiClient from './axios';
import type { ConfigResponse, UpdateConfigRequest, BatchUpdateConfigRequest } from '../types/config';
import type { ApiListResponse, ApiSingleResponse } from './adapter';

const BASE = '/config';

export const configApi = {
  getAll: () =>
    apiClient.get<ApiListResponse<ConfigResponse>>(BASE).then(r => r.data),

  getConfig: (key: string) =>
    apiClient.get<ApiSingleResponse<ConfigResponse>>(`${BASE}/${key}`).then(r => r.data),

  updateConfig: (key: string, data: UpdateConfigRequest) =>
    apiClient.put<ApiSingleResponse<ConfigResponse>>(`${BASE}/${key}`, data).then(r => r.data),

  batchUpdate: (data: BatchUpdateConfigRequest) =>
    apiClient.put<ApiSingleResponse<void>>(`${BASE}/batch`, data).then(r => r.data),
};
