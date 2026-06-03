package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.checkin.BoardingPassResponse;
import com.vemaybay.dto.checkin.CheckInRequest;
import com.vemaybay.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BoardingPassResponse>> checkIn(
            @Valid @RequestBody CheckInRequest request) {
        BoardingPassResponse response = checkInService.checkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Check-in thành công"));
    }

    @GetMapping("/{maVe}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BoardingPassResponse>> getBoardingPass(
            @PathVariable Integer maVe) {
        BoardingPassResponse response = checkInService.getBoardingPass(maVe);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/ticket-code/{maVeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BoardingPassResponse>> getBoardingPassByTicketCode(
            @PathVariable String maVeCode) {
        BoardingPassResponse response = checkInService.getBoardingPassByTicketCode(maVeCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
