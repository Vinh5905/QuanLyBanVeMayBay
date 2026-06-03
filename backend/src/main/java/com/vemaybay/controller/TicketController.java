package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.ticket.*;
import com.vemaybay.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTickets(TicketSearchRequest request) {
        return ResponseEntity.ok(ticketService.getTickets(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('KhachHang', 'DaiLy')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        List<TicketResponse> tickets = ticketService.getMyTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Integer id) {
        TicketResponse response = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/code/{maVeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketByCode(@PathVariable String maVeCode) {
        TicketResponse response = ticketService.getTicketByCode(maVeCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/sell")
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien', 'DaiLy')")
    public ResponseEntity<ApiResponse<TicketResponse>> sellTicket(
            @Valid @RequestBody SellTicketRequest request) {
        TicketResponse response = ticketService.sellTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Bán vé thành công"));
    }

    @PutMapping("/{id}/change-flight")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> changeFlight(
            @PathVariable Integer id,
            @Valid @RequestBody ChangeFlightRequest request) {
        TicketResponse response = ticketService.changeFlight(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Đổi chuyến bay thành công"));
    }

    @PutMapping("/{id}/upgrade")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> upgrade(
            @PathVariable Integer id,
            @Valid @RequestBody UpgradeRequest request) {
        TicketResponse response = ticketService.upgrade(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Nâng hạng ghế thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelTicket(@PathVariable Integer id) {
        ticketService.cancelTicket(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy vé thành công"));
    }
}
