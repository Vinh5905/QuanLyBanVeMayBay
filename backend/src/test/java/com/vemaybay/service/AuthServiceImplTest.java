package com.vemaybay.service;

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
import com.vemaybay.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl Unit Tests")
class AuthServiceImplTest {

    @Mock TaiKhoanRepository taiKhoanRepository;
    @Mock VaiTroRepository vaiTroRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AuthServiceImpl authService;

    private VaiTro vaiTroKhachHang;
    private TaiKhoan activeTaiKhoan;

    @BeforeEach
    void setUp() {
        vaiTroKhachHang = VaiTro.builder()
                .maVaiTro(4)
                .tenVaiTro("KhachHang")
                .build();

        activeTaiKhoan = TaiKhoan.builder()
                .maTaiKhoan(1)
                .tenDangNhap("testuser")
                .matKhauHash("$2a$10$hashedPassword")
                .email("test@test.com")
                .vaiTro(vaiTroKhachHang)
                .trangThai((byte) 1)
                .build();
    }

    // ─── Login tests ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class LoginTests {

        @Test
        @DisplayName("Đăng nhập thành công với thông tin hợp lệ")
        void login_success() {
            when(taiKhoanRepository.findByTenDangNhap("testuser"))
                    .thenReturn(Optional.of(activeTaiKhoan));
            when(passwordEncoder.matches("password", "$2a$10$hashedPassword")).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(1, "testuser", "KhachHang"))
                    .thenReturn("access-token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(3600000L);
            when(jwtTokenProvider.getRefreshTokenExpiration()).thenReturn(2592000000L);
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(taiKhoanRepository.save(any())).thenReturn(activeTaiKhoan);

            LoginRequest request = new LoginRequest();
            request.setTenDangNhap("testuser");
            request.setMatKhau("password");
            LoginResponse response = authService.login(request, "127.0.0.1", "test-agent");

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getUserInfo().getTenDangNhap()).isEqualTo("testuser");
            assertThat(response.getUserInfo().getVaiTro()).isEqualTo("KhachHang");
        }

        @Test
        @DisplayName("Đăng nhập thất bại: tài khoản không tồn tại")
        void login_userNotFound_throwsUnauthorized() {
            when(taiKhoanRepository.findByTenDangNhap("unknown"))
                    .thenReturn(Optional.empty());

            LoginRequest request = new LoginRequest();
            request.setTenDangNhap("unknown");
            request.setMatKhau("password");

            assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("Đăng nhập thất bại: sai mật khẩu")
        void login_wrongPassword_throwsUnauthorized() {
            when(taiKhoanRepository.findByTenDangNhap("testuser"))
                    .thenReturn(Optional.of(activeTaiKhoan));
            when(passwordEncoder.matches("wrong", "$2a$10$hashedPassword")).thenReturn(false);

            LoginRequest request = new LoginRequest();
            request.setTenDangNhap("testuser");
            request.setMatKhau("wrong");

            assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("Đăng nhập thất bại: tài khoản bị khóa")
        void login_accountLocked_throwsBusinessException() {
            TaiKhoan lockedAccount = TaiKhoan.builder()
                    .maTaiKhoan(2)
                    .tenDangNhap("locked")
                    .matKhauHash("hash")
                    .vaiTro(vaiTroKhachHang)
                    .trangThai((byte) 0)
                    .build();

            when(taiKhoanRepository.findByTenDangNhap("locked"))
                    .thenReturn(Optional.of(lockedAccount));

            LoginRequest request = new LoginRequest();
            request.setTenDangNhap("locked");
            request.setMatKhau("password");

            assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("khóa");
        }

        @Test
        @DisplayName("Khóa tạm thời sau 5 lần đăng nhập sai liên tiếp")
        void login_bruteForce_locksAfter5Failures() {
            when(taiKhoanRepository.findByTenDangNhap("brute"))
                    .thenReturn(Optional.empty());

            LoginRequest request = new LoginRequest();
            request.setTenDangNhap("brute");
            request.setMatKhau("wrong");

            // 5 lần thất bại
            for (int i = 0; i < 5; i++) {
                assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "agent"))
                        .isInstanceOf(UnauthorizedException.class);
            }

            // Lần thứ 6: tài khoản bị khóa tạm thời
            assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("tạm khóa");
        }
    }

    // ─── Register tests ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("Đăng ký tài khoản thành công")
        void register_success() {
            when(taiKhoanRepository.existsByTenDangNhap("newuser")).thenReturn(false);
            when(taiKhoanRepository.existsByEmail("new@test.com")).thenReturn(false);
            when(vaiTroRepository.findByTenVaiTro("KhachHang")).thenReturn(Optional.of(vaiTroKhachHang));
            when(passwordEncoder.encode("Pass@123")).thenReturn("hashed");
            when(taiKhoanRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            RegisterRequest request = new RegisterRequest();
            request.setTenDangNhap("newuser");
            request.setMatKhau("Pass@123");
            request.setEmail("new@test.com");
            request.setHoTen("New User");

            assertThatCode(() -> authService.register(request)).doesNotThrowAnyException();
            verify(taiKhoanRepository).save(any(TaiKhoan.class));
        }

        @Test
        @DisplayName("Đăng ký thất bại: tên đăng nhập đã tồn tại")
        void register_duplicateUsername_throwsConflict() {
            when(taiKhoanRepository.existsByTenDangNhap("testuser")).thenReturn(true);

            RegisterRequest request = new RegisterRequest();
            request.setTenDangNhap("testuser");
            request.setEmail("new@test.com");

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Tên đăng nhập");
        }

        @Test
        @DisplayName("Đăng ký thất bại: email đã được sử dụng")
        void register_duplicateEmail_throwsConflict() {
            when(taiKhoanRepository.existsByTenDangNhap("brandnew")).thenReturn(false);
            when(taiKhoanRepository.existsByEmail("test@test.com")).thenReturn(true);

            RegisterRequest request = new RegisterRequest();
            request.setTenDangNhap("brandnew");
            request.setEmail("test@test.com");

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Email");
        }
    }

    // ─── RefreshToken tests ───────────────────────────────────────────────────

    @Nested
    @DisplayName("refreshToken()")
    class RefreshTokenTests {

        @Test
        @DisplayName("Làm mới token thành công")
        void refreshToken_success() {
            RefreshToken storedToken = RefreshToken.builder()
                    .id(1L)
                    .maTaiKhoan(1)
                    .tokenHash("somehash")
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .isRevoked(false)
                    .build();

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(storedToken));
            when(taiKhoanRepository.findById(1)).thenReturn(Optional.of(activeTaiKhoan));
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(1, "testuser", "KhachHang")).thenReturn("new-access");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(3600000L);
            when(jwtTokenProvider.getRefreshTokenExpiration()).thenReturn(2592000000L);

            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("some-raw-token");
            LoginResponse response = authService.refreshToken(request);

            assertThat(response.getAccessToken()).isEqualTo("new-access");
            verify(refreshTokenRepository).save(argThat(RefreshToken::getIsRevoked));
        }

        @Test
        @DisplayName("Làm mới token thất bại: token không hợp lệ")
        void refreshToken_invalidToken_throwsUnauthorized() {
            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

            RefreshTokenRequest badRequest = new RefreshTokenRequest();
            badRequest.setRefreshToken("bad-token");
            assertThatThrownBy(() -> authService.refreshToken(badRequest))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("Làm mới token thất bại: token đã bị thu hồi")
        void refreshToken_revokedToken_throwsUnauthorized() {
            RefreshToken revokedToken = RefreshToken.builder()
                    .id(1L)
                    .maTaiKhoan(1)
                    .tokenHash("hash")
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .isRevoked(true)
                    .build();

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(revokedToken));

            RefreshTokenRequest revokedRequest = new RefreshTokenRequest();
            revokedRequest.setRefreshToken("revoked");
            assertThatThrownBy(() -> authService.refreshToken(revokedRequest))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("Làm mới token thất bại: token đã hết hạn")
        void refreshToken_expiredToken_throwsUnauthorized() {
            RefreshToken expiredToken = RefreshToken.builder()
                    .id(1L)
                    .maTaiKhoan(1)
                    .tokenHash("hash")
                    .expiresAt(LocalDateTime.now().minusDays(1))
                    .isRevoked(false)
                    .build();

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expiredToken));

            RefreshTokenRequest expiredRequest = new RefreshTokenRequest();
            expiredRequest.setRefreshToken("expired");
            assertThatThrownBy(() -> authService.refreshToken(expiredRequest))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }

    // ─── ChangePassword tests ─────────────────────────────────────────────────

    @Nested
    @DisplayName("changePassword()")
    class ChangePasswordTests {

        @Test
        @DisplayName("Đổi mật khẩu thành công")
        void changePassword_success() {
            when(taiKhoanRepository.findById(1)).thenReturn(Optional.of(activeTaiKhoan));
            when(passwordEncoder.matches("oldPass", "$2a$10$hashedPassword")).thenReturn(true);
            when(passwordEncoder.encode("newPass@123")).thenReturn("newHash");
            when(taiKhoanRepository.save(any())).thenReturn(activeTaiKhoan);

            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setMatKhauHienTai("oldPass");
            request.setMatKhauMoi("newPass@123");

            assertThatCode(() -> authService.changePassword(1, request)).doesNotThrowAnyException();
            verify(refreshTokenRepository).revokeAllByMaTaiKhoan(1);
        }

        @Test
        @DisplayName("Đổi mật khẩu thất bại: mật khẩu hiện tại sai")
        void changePassword_wrongCurrentPassword_throwsBusinessException() {
            when(taiKhoanRepository.findById(1)).thenReturn(Optional.of(activeTaiKhoan));
            when(passwordEncoder.matches("wrongOld", "$2a$10$hashedPassword")).thenReturn(false);

            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setMatKhauHienTai("wrongOld");
            request.setMatKhauMoi("newPass@123");

            assertThatThrownBy(() -> authService.changePassword(1, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Mật khẩu hiện tại không đúng");
        }

        @Test
        @DisplayName("Đổi mật khẩu thất bại: tài khoản không tồn tại")
        void changePassword_userNotFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            ChangePasswordRequest cpReq = new ChangePasswordRequest();
            cpReq.setMatKhauHienTai("old");
            cpReq.setMatKhauMoi("newPass123");
            assertThatThrownBy(() -> authService.changePassword(999, cpReq))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── Logout tests ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("logout()")
    class LogoutTests {

        @Test
        @DisplayName("Đăng xuất thành công với refresh token")
        void logout_withRefreshToken_revokesToken() {
            RefreshToken token = RefreshToken.builder()
                    .id(1L)
                    .maTaiKhoan(1)
                    .tokenHash("hash")
                    .isRevoked(false)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            authService.logout(1, "some-raw-token");

            verify(refreshTokenRepository).save(argThat(RefreshToken::getIsRevoked));
        }

        @Test
        @DisplayName("Đăng xuất thành công mà không cần refresh token")
        void logout_withoutRefreshToken_doesNothing() {
            assertThatCode(() -> authService.logout(1, null)).doesNotThrowAnyException();
            verify(refreshTokenRepository, never()).findByTokenHash(any());
        }
    }

    // ─── getCurrentUser tests ─────────────────────────────────────────────────

    @Nested
    @DisplayName("getCurrentUser()")
    class GetCurrentUserTests {

        @Test
        @DisplayName("Lấy thông tin user hiện tại thành công")
        void getCurrentUser_success() {
            when(taiKhoanRepository.findById(1)).thenReturn(Optional.of(activeTaiKhoan));

            LoginResponse.UserInfo info = authService.getCurrentUser(1);

            assertThat(info.getMaTaiKhoan()).isEqualTo(1);
            assertThat(info.getTenDangNhap()).isEqualTo("testuser");
            assertThat(info.getVaiTro()).isEqualTo("KhachHang");
        }

        @Test
        @DisplayName("Lấy thông tin user thất bại: không tìm thấy tài khoản")
        void getCurrentUser_notFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getCurrentUser(999))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
