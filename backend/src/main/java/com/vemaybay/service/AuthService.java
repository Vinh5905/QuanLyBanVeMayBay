package com.vemaybay.service;

import com.vemaybay.dto.auth.*;

public interface AuthService {

    LoginResponse login(LoginRequest request, String ipAddress, String userAgent);

    LoginResponse refreshToken(RefreshTokenRequest request);

    void logout(Integer userId, String refreshToken);

    LoginResponse.UserInfo getCurrentUser(Integer userId);

    void register(RegisterRequest request);

    void changePassword(Integer userId, ChangePasswordRequest request);
}
