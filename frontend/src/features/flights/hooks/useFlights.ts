import { useState, useEffect, useCallback } from 'react';
import { flightApi } from '../../../api/flightApi';
import type { FlightResponse, FlightSearchRequest, PaginationInfo } from '../../../types/flight';

interface FlightsState {
  flights: FlightResponse[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}

const defaultPagination: PaginationInfo = {
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

export function useFlights(filters: FlightSearchRequest) {
  const [state, setState] = useState<FlightsState>({
    flights: [],
    pagination: defaultPagination,
    isLoading: false,
    error: null,
  });

  const fetchFlights = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await flightApi.getFlights(filters);
      const body = response.data;
      if (body.status === 'success') {
        setState({
          flights: body.data,
          pagination: body.pagination,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: body.message || 'Lỗi tải dữ liệu' }));
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ',
      }));
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  return { ...state, refetch: fetchFlights };
}
