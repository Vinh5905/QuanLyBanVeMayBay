package com.vemaybay.dto.customer;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerResponse {

    private Integer maKhachHang;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String cccd;
    private LocalDate ngaySinh;
    private Integer diemTichLuy;
    private LocalDateTime createdAt;
}
