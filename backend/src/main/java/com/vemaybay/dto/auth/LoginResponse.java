package com.vemaybay.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserInfo userInfo;

    @Getter
    @Builder
    public static class UserInfo {
        private Integer maTaiKhoan;
        private String tenDangNhap;
        private String email;
        private String vaiTro;
    }
}
