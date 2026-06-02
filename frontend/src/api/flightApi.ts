import { apiClient } from './axios';
import type {
  FlightResponse,
  FlightSearchRequest,
  CreateFlightRequest,
  UpdateFlightRequest,
  SanBayResponse,
  ApiListResponse,
  ApiSingleResponse,
} from '../types/flight';

export const flightApi = {
  getFlights(params?: FlightSearchRequest) {
    return apiClient.get<ApiListResponse<FlightResponse>>('/flights', { params });
  },

  getFlightById(id: number) {
    return apiClient.get<ApiSingleResponse<FlightResponse>>(`/flights/${id}`);
  },

  searchFlights(params?: FlightSearchRequest) {
    return apiClient.get<ApiListResponse<FlightResponse>>('/flights/search', { params });
  },

  getAirports() {
    return apiClient.get<ApiSingleResponse<SanBayResponse[]>>('/flights/airports');
  },

  createFlight(data: CreateFlightRequest) {
    return apiClient.post<ApiSingleResponse<FlightResponse>>('/flights', data);
  },

  updateFlight(id: number, data: UpdateFlightRequest) {
    return apiClient.put<ApiSingleResponse<FlightResponse>>(`/flights/${id}`, data);
  },

  cancelFlight(id: number) {
    return apiClient.delete<ApiSingleResponse<void>>(`/flights/${id}`);
  },
};
