package com.vemaybay.dto.customer;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerResponse {
    private Integer maKhachHang;
    private String hoTen;
    private String cccd;
    private String email;
    private String soDienThoai;
    private LocalDateTime createdAt;
}
