package com.vemaybay.service;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.ticket.*;

import java.util.List;

public interface TicketService {

    TicketResponse sellTicket(SellTicketRequest request);

    BookingResponse bookTicket(BookTicketRequest request);

    ApiResponse<List<TicketResponse>> getTickets(TicketSearchRequest request);

    List<TicketResponse> getMyTickets();

    TicketResponse getTicketById(Integer id);

    TicketResponse getTicketByCode(String maVeCode);

    TicketResponse changeFlight(Integer id, ChangeFlightRequest request);

    TicketResponse upgrade(Integer id, UpgradeRequest request);

    void cancelTicket(Integer id);

    ApiResponse<List<BookingResponse>> getBookings(TicketSearchRequest request);

    List<BookingResponse> getMyBookings();

    void cancelBooking(Integer id);
}
