import apiClient from './axios';
import type { PaymentRequest, PaymentResponse, PaymentSearchParams } from '../types/payment';
import type { ApiListResponse, ApiSingleResponse } from './adapter';

const BASE = '/payments';

export const paymentApi = {
  createPayment: (data: PaymentRequest) =>
    apiClient.post<ApiSingleResponse<PaymentResponse>>(BASE, data).then(r => r.data),

  getPaymentById: (id: number) =>
    apiClient.get<ApiSingleResponse<PaymentResponse>>(`${BASE}/${id}`).then(r => r.data),

  getPayments: (params?: PaymentSearchParams) =>
    apiClient.get<ApiListResponse<PaymentResponse>>(BASE, { params }).then(r => r.data),
};
