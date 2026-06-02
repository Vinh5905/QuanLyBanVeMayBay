import apiClient from './axios';
import type { CheckInRequest, BoardingPassResponse } from '../types/checkin';
import type { ApiSingleResponse } from './adapter';

const BASE = '/checkin';

export const checkinApi = {
  checkIn: (data: CheckInRequest) =>
    apiClient.post<ApiSingleResponse<BoardingPassResponse>>(BASE, data).then(r => r.data),

  getBoardingPass: (maVe: number) =>
    apiClient.get<ApiSingleResponse<BoardingPassResponse>>(`${BASE}/${maVe}`).then(r => r.data),
};
