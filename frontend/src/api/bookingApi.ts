import apiClient from './axios';
import type { BookingResponse, BookTicketRequest } from '../types/ticket';
import type { ApiListResponse, ApiSingleResponse } from './adapter';

const BASE = '/bookings';

export const bookingApi = {
  createBooking: (data: BookTicketRequest) =>
    apiClient.post<ApiSingleResponse<BookingResponse>>(BASE, data).then(r => r.data),

  getMyBookings: () =>
    apiClient.get<ApiListResponse<BookingResponse>>(`${BASE}/my`).then(r => r.data),

  cancelBooking: (id: number) =>
    apiClient.delete<ApiSingleResponse<void>>(`${BASE}/${id}`).then(r => r.data),
};
