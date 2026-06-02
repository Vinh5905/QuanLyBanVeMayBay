import { useState, useEffect } from 'react';
import { flightApi } from '../../../api/flightApi';
import type { SanBayResponse } from '../../../types/flight';

export function useAirports() {
  const [airports, setAirports] = useState<SanBayResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    flightApi.getAirports()
      .then(res => {
        if (!cancelled && res.data.status === 'success') {
          setAirports(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { airports, isLoading };
}
