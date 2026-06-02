import apiClient from './axios';
import type { AccountResponse, CreateAccountRequest, UpdateAccountRequest, AccountSearchParams } from '../types/account';
import type { ApiListResponse, ApiSingleResponse } from './adapter';

const BASE = '/accounts';

export const accountApi = {
  getAccounts: (params?: AccountSearchParams) =>
    apiClient.get<ApiListResponse<AccountResponse>>(BASE, { params }).then(r => r.data),

  getAccountById: (id: number) =>
    apiClient.get<ApiSingleResponse<AccountResponse>>(`${BASE}/${id}`).then(r => r.data),

  createAccount: (data: CreateAccountRequest) =>
    apiClient.post<ApiSingleResponse<AccountResponse>>(BASE, data).then(r => r.data),

  updateAccount: (id: number, data: UpdateAccountRequest) =>
    apiClient.put<ApiSingleResponse<AccountResponse>>(`${BASE}/${id}`, data).then(r => r.data),

  updateStatus: (id: number, data: { trangThai: number }) =>
    apiClient.put<ApiSingleResponse<AccountResponse>>(`${BASE}/${id}/status`, data).then(r => r.data),

  resetPassword: (id: number) =>
    apiClient.put<ApiSingleResponse<void>>(`${BASE}/${id}/reset-password`).then(r => r.data),
};
