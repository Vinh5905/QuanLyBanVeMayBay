package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.customer.CustomerResponse;
import com.vemaybay.dto.customer.CustomerSearchRequest;
import com.vemaybay.entity.KhachHang;
import com.vemaybay.repository.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('Admin', 'NhanVien', 'DaiLy')")
public class CustomerController {

    private final KhachHangRepository khachHangRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getCustomers(CustomerSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, sortParts[0]);
        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);
        String keyword = request.getKeyword() != null && !request.getKeyword().isBlank()
                ? request.getKeyword().trim()
                : null;

        Page<KhachHang> page = khachHangRepository.findWithFilters(keyword, pageRequest);
        List<CustomerResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.successWithPagination(data, PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build()));
    }

    private CustomerResponse toResponse(KhachHang kh) {
        return CustomerResponse.builder()
                .maKhachHang(kh.getMaKhachHang())
                .hoTen(kh.getHoTen())
                .email(kh.getEmail())
                .soDienThoai(kh.getSoDienThoai())
                .cccd(kh.getCccd())
                .ngaySinh(kh.getNgaySinh())
                .diemTichLuy(kh.getDiemTichLuy())
                .createdAt(kh.getCreatedAt())
                .build();
    }
}
