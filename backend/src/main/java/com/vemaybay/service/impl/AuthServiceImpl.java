package com.vemaybay.service.impl;

import com.vemaybay.dto.auth.*;
import com.vemaybay.entity.RefreshToken;
import com.vemaybay.entity.TaiKhoan;
import com.vemaybay.entity.VaiTro;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.exception.UnauthorizedException;
import com.vemaybay.repository.RefreshTokenRepository;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.VaiTroRepository;
import com.vemaybay.security.JwtTokenProvider;
import com.vemaybay.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.password-reset.otp-expiration-minutes:10}")
    private long otpExpirationMinutes;

    @Value("${app.password-reset.token-expiration-minutes:15}")
    private long resetTokenExpirationMinutes;

    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, PasswordResetOtp> passwordResetOtps = new ConcurrentHashMap<>();
    private final Map<String, PasswordResetToken> passwordResetTokens = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        checkBruteForce(request.getTenDangNhap());

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> {
                    recordFailedAttempt(request.getTenDangNhap());
                    return new UnauthorizedException("Thông tin đăng nhập không hợp lệ");
                });

        if (!taiKhoan.isActive()) {
            throw new BusinessException("ACCOUNT_LOCKED", "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        if (!passwordEncoder.matches(request.getMatKhau(), taiKhoan.getMatKhauHash())) {
            recordFailedAttempt(request.getTenDangNhap());
            throw new UnauthorizedException("Thông tin đăng nhập không hợp lệ");
        }

        clearLoginAttempts(request.getTenDangNhap());

        String role = taiKhoan.getVaiTro().getTenVaiTro();
        String accessToken = jwtTokenProvider.generateAccessToken(
                taiKhoan.getMaTaiKhoan(), taiKhoan.getTenDangNhap(), role);
        String refreshToken = createRefreshToken(taiKhoan.getMaTaiKhoan());

        taiKhoan.setLastLogin(LocalDateTime.now());
        taiKhoanRepository.save(taiKhoan);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .userInfo(LoginResponse.UserInfo.builder()
                        .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                        .tenDangNhap(taiKhoan.getTenDangNhap())
                        .email(taiKhoan.getEmail())
                        .vaiTro(role)
                        .build())
                .build();
    }

    @Override
    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token không hợp lệ"));

        if (!storedToken.isUsable()) {
            throw new UnauthorizedException("Refresh token đã hết hạn hoặc bị thu hồi");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findById(storedToken.getMaTaiKhoan())
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại"));

        if (!taiKhoan.isActive()) {
            throw new BusinessException("ACCOUNT_LOCKED", "Tài khoản đã bị khóa");
        }

        storedToken.setIsRevoked(true);
        refreshTokenRepository.save(storedToken);

        String role = taiKhoan.getVaiTro().getTenVaiTro();
        String accessToken = jwtTokenProvider.generateAccessToken(
                taiKhoan.getMaTaiKhoan(), taiKhoan.getTenDangNhap(), role);
        String newRefreshToken = createRefreshToken(taiKhoan.getMaTaiKhoan());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .userInfo(LoginResponse.UserInfo.builder()
                        .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                        .tenDangNhap(taiKhoan.getTenDangNhap())
                        .email(taiKhoan.getEmail())
                        .vaiTro(role)
                        .build())
                .build();
    }

    @Override
    @Transactional
    public void logout(Integer userId, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            String tokenHash = hashToken(refreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash)
                    .ifPresent(token -> {
                        token.setIsRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
    }

    @Override
    public LoginResponse.UserInfo getCurrentUser(Integer userId) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", userId));

        return LoginResponse.UserInfo.builder()
                .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                .tenDangNhap(taiKhoan.getTenDangNhap())
                .email(taiKhoan.getEmail())
                .vaiTro(taiKhoan.getVaiTro().getTenVaiTro())
                .build();
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new ConflictException("DUPLICATE_USERNAME", "Tên đăng nhập đã tồn tại");
        }
        if (taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("DUPLICATE_EMAIL", "Email đã được sử dụng");
        }

        VaiTro vaiTroKhachHang = vaiTroRepository.findByTenVaiTro("KhachHang")
                .orElseThrow(() -> new BusinessException("Vai trò KhachHang không tồn tại trong hệ thống"));

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .tenDangNhap(request.getTenDangNhap())
                .matKhauHash(passwordEncoder.encode(request.getMatKhau()))
                .vaiTro(vaiTroKhachHang)
                .email(request.getEmail())
                .trangThai((byte) 1)
                .build();

        taiKhoanRepository.save(taiKhoan);
    }

    @Override
    @Transactional(readOnly = true)
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này"));

        if (!taiKhoan.isActive()) {
            throw new BusinessException("ACCOUNT_LOCKED", "Tài khoản đã bị khóa");
        }

        if (mailPassword == null || mailPassword.isBlank()) {
            throw new BusinessException("MAIL_NOT_CONFIGURED",
                    "Chưa cấu hình MAIL_PASSWORD cho Gmail SMTP");
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);
        passwordResetOtps.put(email, new PasswordResetOtp(taiKhoan.getMaTaiKhoan(), otp, expiresAt));

        sendPasswordResetEmail(email, otp, expiresAt);
    }

    @Override
    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        PasswordResetOtp storedOtp = passwordResetOtps.get(email);

        if (storedOtp == null || storedOtp.isExpired()) {
            passwordResetOtps.remove(email);
            throw new BusinessException("OTP_EXPIRED", "Mã OTP không tồn tại hoặc đã hết hạn");
        }

        if (!storedOtp.otp().equals(request.getOtp())) {
            throw new BusinessException("INVALID_OTP", "Mã OTP không đúng");
        }

        passwordResetOtps.remove(email);
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetTokenExpirationMinutes);
        passwordResetTokens.put(resetToken, new PasswordResetToken(storedOtp.maTaiKhoan(), expiresAt));

        return VerifyResetOtpResponse.builder()
                .resetToken(resetToken)
                .expiresInSeconds(resetTokenExpirationMinutes * 60)
                .build();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokens.remove(request.getResetToken());

        if (token == null || token.isExpired()) {
            throw new BusinessException("RESET_TOKEN_EXPIRED", "Phiên đặt lại mật khẩu đã hết hạn");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findById(token.maTaiKhoan())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", token.maTaiKhoan()));

        taiKhoan.setMatKhauHash(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(taiKhoan);
        refreshTokenRepository.revokeAllByMaTaiKhoan(taiKhoan.getMaTaiKhoan());
    }

    @Override
    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", userId));

        if (!passwordEncoder.matches(request.getMatKhauHienTai(), taiKhoan.getMatKhauHash())) {
            throw new BusinessException("WRONG_PASSWORD", "Mật khẩu hiện tại không đúng");
        }

        taiKhoan.setMatKhauHash(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(taiKhoan);

        refreshTokenRepository.revokeAllByMaTaiKhoan(userId);
    }

    private String createRefreshToken(Integer maTaiKhoan) {
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        long expirationDays = jwtTokenProvider.getRefreshTokenExpiration() / (1000 * 60 * 60 * 24);

        RefreshToken refreshToken = RefreshToken.builder()
                .maTaiKhoan(maTaiKhoan)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusDays(expirationDays))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private void checkBruteForce(String username) {
        LoginAttempt attempt = loginAttempts.get(username);
        if (attempt != null && attempt.isLocked()) {
            long minutesLeft = attempt.minutesUntilUnlock();
            throw new BusinessException("ACCOUNT_TEMPORARILY_LOCKED",
                    String.format("Tài khoản tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau %d phút.", minutesLeft));
        }
    }

    private void recordFailedAttempt(String username) {
        loginAttempts.compute(username, (key, attempt) -> {
            if (attempt == null || attempt.isExpired()) {
                return new LoginAttempt(1, LocalDateTime.now());
            }
            attempt.increment();
            return attempt;
        });
    }

    private void clearLoginAttempts(String username) {
        loginAttempts.remove(username);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private void sendPasswordResetEmail(String email, String otp, LocalDateTime expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailUsername);
        message.setTo(email);
        message.setSubject("QAirline - Mã OTP đặt lại mật khẩu");
        message.setText("""
                Bạn đang yêu cầu đặt lại mật khẩu QAirline.

                Mã OTP của bạn là: %s

                Mã này sẽ hết hạn lúc: %s
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                """.formatted(otp, expiresAt));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Could not send password reset OTP to {}", email, ex);
            throw new BusinessException("MAIL_SEND_FAILED",
                    "Không thể gửi email OTP. Vui lòng kiểm tra cấu hình Gmail SMTP");
        }
    }

    private record PasswordResetOtp(Integer maTaiKhoan, String otp, LocalDateTime expiresAt) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    private record PasswordResetToken(Integer maTaiKhoan, LocalDateTime expiresAt) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    private static class LoginAttempt {
        private int count;
        private LocalDateTime firstAttempt;
        private LocalDateTime lockedAt;

        LoginAttempt(int count, LocalDateTime firstAttempt) {
            this.count = count;
            this.firstAttempt = firstAttempt;
        }

        void increment() {
            this.count++;
            if (this.count >= MAX_ATTEMPTS) {
                this.lockedAt = LocalDateTime.now();
            }
        }

        boolean isLocked() {
            return lockedAt != null &&
                    LocalDateTime.now().isBefore(lockedAt.plusMinutes(LOCK_DURATION_MINUTES));
        }

        boolean isExpired() {
            return firstAttempt.plusMinutes(LOCK_DURATION_MINUTES).isBefore(LocalDateTime.now());
        }

        long minutesUntilUnlock() {
            if (lockedAt == null) return 0;
            LocalDateTime unlockTime = lockedAt.plusMinutes(LOCK_DURATION_MINUTES);
            return java.time.Duration.between(LocalDateTime.now(), unlockTime).toMinutes() + 1;
        }
    }
}
