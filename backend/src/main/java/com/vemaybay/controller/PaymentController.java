package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.payment.PaymentRequest;
import com.vemaybay.dto.payment.PaymentResponse;
import com.vemaybay.dto.payment.PaymentSearchRequest;
import com.vemaybay.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien', 'DaiLy', 'KhachHang')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Thanh toán thành công"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPayments(PaymentSearchRequest request) {
        return ResponseEntity.ok(paymentService.getPayments(request));
    }
}
