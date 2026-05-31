package com.vemaybay.dto.account;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AccountResponse {

    private Integer maTaiKhoan;
    private String tenDangNhap;
    private String email;
    private String vaiTro;
    private Integer maVaiTro;
    private Integer maKhachHang;
    private Integer trangThai;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
