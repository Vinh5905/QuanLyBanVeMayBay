package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.customer.CreateCustomerRequest;
import com.vemaybay.dto.customer.CustomerResponse;
import com.vemaybay.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien', 'DaiLy')")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> searchByCccd(
            @RequestParam String cccd) {
        List<CustomerResponse> customers = customerService.searchByCccd(cccd);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'NhanVien', 'DaiLy')")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tạo khách hàng thành công"));
    }
}
