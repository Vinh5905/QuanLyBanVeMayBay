package com.vemaybay.service.impl;

import com.vemaybay.dto.customer.CreateCustomerRequest;
import com.vemaybay.dto.customer.CustomerResponse;
import com.vemaybay.entity.KhachHang;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.repository.KhachHangRepository;
import com.vemaybay.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final KhachHangRepository khachHangRepository;

    @Override
    public List<CustomerResponse> searchByCccd(String cccd) {
        return khachHangRepository.findByCccdAndIsDeletedFalse(cccd).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (khachHangRepository.existsByCccdAndIsDeletedFalse(request.getCccd())) {
            throw new ConflictException("CCCD_EXISTS",
                    "Khách hàng với CCCD " + request.getCccd() + " đã tồn tại");
        }

        KhachHang kh = KhachHang.builder()
                .hoTen(request.getHoTen())
                .cccd(request.getCccd())
                .email(request.getEmail())
                .soDienThoai(request.getSoDienThoai())
                .diemTichLuy(0)
                .build();

        kh = khachHangRepository.save(kh);
        return toResponse(kh);
    }

    private CustomerResponse toResponse(KhachHang kh) {
        return CustomerResponse.builder()
                .maKhachHang(kh.getMaKhachHang())
                .hoTen(kh.getHoTen())
                .cccd(kh.getCccd())
                .email(kh.getEmail())
                .soDienThoai(kh.getSoDienThoai())
                .createdAt(kh.getCreatedAt())
                .build();
    }
}
