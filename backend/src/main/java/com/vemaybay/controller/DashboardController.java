package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.dashboard.DashboardSummaryResponse;
import com.vemaybay.dto.dashboard.RevenueChartResponse;
import com.vemaybay.dto.dashboard.TicketClassChartResponse;
import com.vemaybay.dto.flight.FlightResponse;
import com.vemaybay.dto.ticket.TicketResponse;
import com.vemaybay.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary()));
    }

    @GetMapping("/charts/revenue")
    public ResponseEntity<ApiResponse<List<RevenueChartResponse>>> getRevenueChart() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueChart()));
    }

    @GetMapping("/charts/tickets")
    public ResponseEntity<ApiResponse<List<TicketClassChartResponse>>> getTicketClassChart() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTicketClassChart()));
    }

    @GetMapping("/recent/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getRecentTickets() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRecentTickets()));
    }

    @GetMapping("/today/flights")
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getTodayFlights() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTodayFlights()));
    }
}
