package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.flight.*;
import com.vemaybay.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getFlights(
            FlightSearchRequest request) {
        ApiResponse<List<FlightResponse>> response = flightService.getFlights(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FlightResponse>>> searchFlights(
            FlightSearchRequest request) {
        List<FlightResponse> results = flightService.searchFlights(request);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/airports")
    public ResponseEntity<ApiResponse<List<SanBayResponse>>> getAirports() {
        List<SanBayResponse> airports = flightService.getAllAirports();
        return ResponseEntity.ok(ApiResponse.success(airports));
    }

    @GetMapping("/ticket-classes")
    public ResponseEntity<ApiResponse<List<HangVeResponse>>> getTicketClasses() {
        List<HangVeResponse> ticketClasses = flightService.getActiveTicketClasses();
        return ResponseEntity.ok(ApiResponse.success(ticketClasses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightResponse>> getFlightById(@PathVariable Integer id) {
        FlightResponse response = flightService.getFlightById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<FlightResponse>> createFlight(
            @Valid @RequestBody CreateFlightRequest request) {
        FlightResponse response = flightService.createFlight(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tạo chuyến bay thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<FlightResponse>> updateFlight(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateFlightRequest request) {
        FlightResponse response = flightService.updateFlight(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật chuyến bay thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<Void>> cancelFlight(@PathVariable Integer id) {
        flightService.cancelFlight(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy chuyến bay thành công"));
    }
}
