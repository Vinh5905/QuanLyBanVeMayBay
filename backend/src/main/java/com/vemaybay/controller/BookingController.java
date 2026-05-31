package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.ticket.BookingResponse;
import com.vemaybay.dto.ticket.BookTicketRequest;
import com.vemaybay.dto.ticket.TicketSearchRequest;
import com.vemaybay.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyRole('KhachHang')")
    public ResponseEntity<ApiResponse<BookingResponse>> bookTicket(
            @Valid @RequestBody BookTicketRequest request) {
        BookingResponse response = ticketService.bookTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Đặt vé thành công"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(TicketSearchRequest request) {
        return ResponseEntity.ok(ticketService.getBookings(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('KhachHang')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        List<BookingResponse> bookings = ticketService.getMyBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable Integer id) {
        ticketService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy đặt chỗ thành công"));
    }
}
