package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.baggage.BaggagePricingResponse;
import com.vemaybay.dto.baggage.BaggageResponse;
import com.vemaybay.dto.baggage.RegisterBaggageRequest;
import com.vemaybay.service.BaggageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/baggage")
@RequiredArgsConstructor
public class BaggageController {

    private final BaggageService baggageService;

    @GetMapping("/pricing")
    public ResponseEntity<ApiResponse<List<BaggagePricingResponse>>> getPricing() {
        List<BaggagePricingResponse> pricing = baggageService.getPricing();
        return ResponseEntity.ok(ApiResponse.success(pricing));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BaggageResponse>> registerBaggage(
            @Valid @RequestBody RegisterBaggageRequest request) {
        BaggageResponse response = baggageService.registerBaggage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Đăng ký hành lý thành công"));
    }

    @GetMapping("/ticket/{maVe}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BaggageResponse>>> getBaggageByTicket(
            @PathVariable Integer maVe) {
        List<BaggageResponse> list = baggageService.getBaggageByTicket(maVe);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> cancelBaggage(@PathVariable Integer id) {
        baggageService.cancelBaggage(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy gói hành lý thành công"));
    }
}
