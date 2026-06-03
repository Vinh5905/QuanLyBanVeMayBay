package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.profile.ProfileResponse;
import com.vemaybay.dto.profile.UpdateProfileRequest;
import com.vemaybay.entity.KhachHang;
import com.vemaybay.entity.TaiKhoan;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.KhachHangRepository;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('KhachHang')")
public class ProfileController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", principal.getUserId()));

        if (taiKhoan.getMaKhachHang() == null) {
            throw new BusinessException("NO_CUSTOMER_PROFILE", "Tài khoản chưa có hồ sơ khách hàng");
        }

        KhachHang kh = khachHangRepository.findByMaKhachHangAndIsDeletedFalse(taiKhoan.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Hồ sơ khách hàng", "id", taiKhoan.getMaKhachHang()));

        String hangThanhVien = null;
        if (kh.getMaHangThanhVien() != null) {
            List<String> names = jdbcTemplate.queryForList(
                    "SELECT TenHang FROM dbo.HANGTHANHVIEN WHERE MaHangThanhVien = ?",
                    String.class, kh.getMaHangThanhVien());
            hangThanhVien = names.isEmpty() ? null : names.get(0);
        }

        return ResponseEntity.ok(ApiResponse.success(ProfileResponse.builder()
                .maKhachHang(kh.getMaKhachHang())
                .hoTen(kh.getHoTen())
                .email(kh.getEmail())
                .soDienThoai(kh.getSoDienThoai())
                .cccd(kh.getCccd())
                .ngaySinh(kh.getNgaySinh())
                .diemTichLuy(kh.getDiemTichLuy())
                .hangThanhVien(hangThanhVien)
                .tenDangNhap(taiKhoan.getTenDangNhap())
                .build()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", principal.getUserId()));

        if (taiKhoan.getMaKhachHang() == null) {
            throw new BusinessException("NO_CUSTOMER_PROFILE", "Tài khoản chưa có hồ sơ khách hàng");
        }

        KhachHang kh = khachHangRepository.findByMaKhachHangAndIsDeletedFalse(taiKhoan.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Hồ sơ khách hàng", "id", taiKhoan.getMaKhachHang()));

        if (request.getHoTen() != null) kh.setHoTen(request.getHoTen());
        if (request.getSoDienThoai() != null) kh.setSoDienThoai(request.getSoDienThoai());
        if (request.getCccd() != null) kh.setCccd(request.getCccd());
        if (request.getNgaySinh() != null) kh.setNgaySinh(request.getNgaySinh());

        khachHangRepository.save(kh);

        String hangThanhVien = null;
        if (kh.getMaHangThanhVien() != null) {
            List<String> names = jdbcTemplate.queryForList(
                    "SELECT TenHang FROM dbo.HANGTHANHVIEN WHERE MaHangThanhVien = ?",
                    String.class, kh.getMaHangThanhVien());
            hangThanhVien = names.isEmpty() ? null : names.get(0);
        }

        return ResponseEntity.ok(ApiResponse.success(ProfileResponse.builder()
                .maKhachHang(kh.getMaKhachHang())
                .hoTen(kh.getHoTen())
                .email(kh.getEmail())
                .soDienThoai(kh.getSoDienThoai())
                .cccd(kh.getCccd())
                .ngaySinh(kh.getNgaySinh())
                .diemTichLuy(kh.getDiemTichLuy())
                .hangThanhVien(hangThanhVien)
                .tenDangNhap(taiKhoan.getTenDangNhap())
                .build(), "Cập nhật hồ sơ thành công"));
    }
}
