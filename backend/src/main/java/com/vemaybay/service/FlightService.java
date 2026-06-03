package com.vemaybay.service;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.flight.*;

import java.util.List;

public interface FlightService {

    FlightResponse createFlight(CreateFlightRequest request);

    FlightResponse getFlightById(Integer id);

    ApiResponse<List<FlightResponse>> getFlights(FlightSearchRequest request);

    FlightResponse updateFlight(Integer id, UpdateFlightRequest request);

    void cancelFlight(Integer id);

    List<FlightResponse> searchFlights(FlightSearchRequest request);

    List<SanBayResponse> getAllAirports();

    List<HangVeResponse> getActiveTicketClasses();
}
