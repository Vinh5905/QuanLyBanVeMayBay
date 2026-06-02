package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.auth.*;
import com.vemaybay.security.UserPrincipal;
import com.vemaybay.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        LoginResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(response, "Đăng nhập thành công"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Làm mới token thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) RefreshTokenRequest request) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        authService.logout(principal.getUserId(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success(null, "Đăng xuất thành công"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> me(
            @AuthenticationPrincipal UserPrincipal principal) {
        LoginResponse.UserInfo userInfo = authService.getCurrentUser(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(null, "Đăng ký tài khoản thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mã OTP đã được gửi tới email"));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<VerifyResetOtpResponse>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {
        VerifyResetOtpResponse response = authService.verifyResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Xác thực OTP thành công"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
