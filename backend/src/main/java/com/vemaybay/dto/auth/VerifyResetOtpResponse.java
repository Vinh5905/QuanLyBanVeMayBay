package com.vemaybay.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VerifyResetOtpResponse {

    private String resetToken;
    private long expiresInSeconds;
}
