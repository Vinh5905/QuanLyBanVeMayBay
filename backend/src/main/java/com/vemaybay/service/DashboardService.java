package com.vemaybay.service;

import com.vemaybay.dto.dashboard.DashboardSummaryResponse;
import com.vemaybay.dto.dashboard.RevenueChartResponse;
import com.vemaybay.dto.dashboard.TicketClassChartResponse;
import com.vemaybay.dto.flight.FlightResponse;
import com.vemaybay.dto.ticket.TicketResponse;

import java.util.List;

public interface DashboardService {

    DashboardSummaryResponse getSummary();

    List<RevenueChartResponse> getRevenueChart();

    List<TicketClassChartResponse> getTicketClassChart();

    List<TicketResponse> getRecentTickets();

    List<FlightResponse> getTodayFlights();
}
