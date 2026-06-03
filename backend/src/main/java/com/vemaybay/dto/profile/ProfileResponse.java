package com.vemaybay.dto.profile;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProfileResponse {
    private Integer maKhachHang;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String cccd;
    private LocalDate ngaySinh;
    private Integer diemTichLuy;
    private String hangThanhVien;
    private String tenDangNhap;
}
