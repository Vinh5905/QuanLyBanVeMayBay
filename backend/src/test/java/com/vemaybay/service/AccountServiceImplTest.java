package com.vemaybay.service;

import com.vemaybay.dto.account.AccountResponse;
import com.vemaybay.dto.account.CreateAccountRequest;
import com.vemaybay.dto.account.UpdateAccountRequest;
import com.vemaybay.entity.TaiKhoan;
import com.vemaybay.entity.VaiTro;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.VaiTroRepository;
import com.vemaybay.service.impl.AccountServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AccountServiceImpl Unit Tests")
class AccountServiceImplTest {

    @Mock TaiKhoanRepository taiKhoanRepository;
    @Mock VaiTroRepository vaiTroRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AccountServiceImpl accountService;

    private VaiTro vaiTroNhanVien;
    private TaiKhoan existingTaiKhoan;

    @BeforeEach
    void setUp() {
        vaiTroNhanVien = VaiTro.builder()
                .maVaiTro(2)
                .tenVaiTro("NhanVien")
                .build();

        existingTaiKhoan = TaiKhoan.builder()
                .maTaiKhoan(10)
                .tenDangNhap("staff01")
                .matKhauHash("$hashed")
                .vaiTro(vaiTroNhanVien)
                .email("staff01@airline.vn")
                .trangThai((byte) 1)
                .build();
    }

    // ─── getAccountById ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAccountById()")
    class GetAccountByIdTests {

        @Test
        @DisplayName("Lấy thông tin tài khoản theo ID thành công")
        void getAccountById_success() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));

            AccountResponse result = accountService.getAccountById(10);

            assertThat(result.getMaTaiKhoan()).isEqualTo(10);
            assertThat(result.getTenDangNhap()).isEqualTo("staff01");
            assertThat(result.getVaiTro()).isEqualTo("NhanVien");
        }

        @Test
        @DisplayName("Lấy tài khoản thất bại: ID không tồn tại")
        void getAccountById_notFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> accountService.getAccountById(999))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── createAccount ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createAccount()")
    class CreateAccountTests {

        @Test
        @DisplayName("Tạo tài khoản NhanVien thành công")
        void createAccount_nhanVien_success() {
            when(taiKhoanRepository.existsByTenDangNhap("staff02")).thenReturn(false);
            when(taiKhoanRepository.existsByEmail("staff02@airline.vn")).thenReturn(false);
            when(vaiTroRepository.findByTenVaiTro("NhanVien")).thenReturn(Optional.of(vaiTroNhanVien));
            when(passwordEncoder.encode("Staff@2026")).thenReturn("hashedPass");
            when(taiKhoanRepository.save(any())).thenAnswer(inv -> {
                TaiKhoan saved = inv.getArgument(0);
                saved = TaiKhoan.builder()
                        .maTaiKhoan(11)
                        .tenDangNhap(saved.getTenDangNhap())
                        .matKhauHash(saved.getMatKhauHash())
                        .vaiTro(saved.getVaiTro())
                        .email(saved.getEmail())
                        .trangThai((byte) 1)
                        .build();
                return saved;
            });

            CreateAccountRequest request = new CreateAccountRequest();
            request.setTenDangNhap("staff02");
            request.setMatKhau("Staff@2026");
            request.setEmail("staff02@airline.vn");
            request.setVaiTro("NhanVien");

            AccountResponse result = accountService.createAccount(request);

            assertThat(result.getTenDangNhap()).isEqualTo("staff02");
            assertThat(result.getVaiTro()).isEqualTo("NhanVien");
            verify(taiKhoanRepository).save(any(TaiKhoan.class));
        }

        @Test
        @DisplayName("Tạo tài khoản thất bại: tên đăng nhập đã tồn tại")
        void createAccount_duplicateUsername_throwsConflict() {
            when(taiKhoanRepository.existsByTenDangNhap("staff01")).thenReturn(true);

            CreateAccountRequest request = new CreateAccountRequest();
            request.setTenDangNhap("staff01");
            request.setEmail("new@airline.vn");
            request.setMatKhau("Pass@123");
            request.setVaiTro("NhanVien");

            assertThatThrownBy(() -> accountService.createAccount(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Tên đăng nhập");
        }

        @Test
        @DisplayName("Tạo tài khoản thất bại: email đã được sử dụng")
        void createAccount_duplicateEmail_throwsConflict() {
            when(taiKhoanRepository.existsByTenDangNhap("newstaff")).thenReturn(false);
            when(taiKhoanRepository.existsByEmail("staff01@airline.vn")).thenReturn(true);

            CreateAccountRequest request = new CreateAccountRequest();
            request.setTenDangNhap("newstaff");
            request.setEmail("staff01@airline.vn");
            request.setMatKhau("Pass@123");
            request.setVaiTro("NhanVien");

            assertThatThrownBy(() -> accountService.createAccount(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Email");
        }

        @Test
        @DisplayName("Tạo tài khoản thất bại: vai trò không tồn tại")
        void createAccount_roleNotFound_throwsResourceNotFound() {
            when(taiKhoanRepository.existsByTenDangNhap("agent01")).thenReturn(false);
            when(taiKhoanRepository.existsByEmail("agent01@airline.vn")).thenReturn(false);
            when(vaiTroRepository.findByTenVaiTro("UnknownRole")).thenReturn(Optional.empty());

            CreateAccountRequest request = new CreateAccountRequest();
            request.setTenDangNhap("agent01");
            request.setEmail("agent01@airline.vn");
            request.setMatKhau("Pass@123");
            request.setVaiTro("UnknownRole");

            assertThatThrownBy(() -> accountService.createAccount(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── updateAccount ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateAccount()")
    class UpdateAccountTests {

        @Test
        @DisplayName("Cập nhật email thành công")
        void updateAccount_email_success() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));
            when(taiKhoanRepository.existsByEmail("new@airline.vn")).thenReturn(false);
            when(taiKhoanRepository.save(any())).thenReturn(existingTaiKhoan);

            UpdateAccountRequest request = new UpdateAccountRequest();
            request.setEmail("new@airline.vn");

            AccountResponse result = accountService.updateAccount(10, request);

            assertThat(result).isNotNull();
            verify(taiKhoanRepository).save(any());
        }

        @Test
        @DisplayName("Cập nhật thất bại: tên đăng nhập mới đã tồn tại")
        void updateAccount_duplicateUsername_throwsConflict() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));
            when(taiKhoanRepository.existsByTenDangNhap("admin")).thenReturn(true);

            UpdateAccountRequest request = new UpdateAccountRequest();
            request.setTenDangNhap("admin");

            assertThatThrownBy(() -> accountService.updateAccount(10, request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Tên đăng nhập");
        }

        @Test
        @DisplayName("Cập nhật thất bại: email mới đã được sử dụng")
        void updateAccount_duplicateEmail_throwsConflict() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));
            when(taiKhoanRepository.existsByEmail("admin@airline.vn")).thenReturn(true);

            UpdateAccountRequest request = new UpdateAccountRequest();
            request.setEmail("admin@airline.vn");

            assertThatThrownBy(() -> accountService.updateAccount(10, request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Email");
        }

        @Test
        @DisplayName("Cập nhật thất bại: tài khoản không tồn tại")
        void updateAccount_notFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> accountService.updateAccount(999, new UpdateAccountRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── setAccountStatus ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("setAccountStatus()")
    class SetAccountStatusTests {

        @Test
        @DisplayName("Khóa tài khoản thành công")
        void setAccountStatus_lock_success() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));
            when(taiKhoanRepository.save(any())).thenReturn(existingTaiKhoan);

            assertThatCode(() -> accountService.setAccountStatus(10, false)).doesNotThrowAnyException();
            verify(taiKhoanRepository).save(argThat(tk -> tk.getTrangThai() == 0));
        }

        @Test
        @DisplayName("Mở khóa tài khoản thành công")
        void setAccountStatus_unlock_success() {
            TaiKhoan lockedAccount = TaiKhoan.builder()
                    .maTaiKhoan(11).tenDangNhap("locked")
                    .vaiTro(vaiTroNhanVien).trangThai((byte) 0).build();

            when(taiKhoanRepository.findById(11)).thenReturn(Optional.of(lockedAccount));
            when(taiKhoanRepository.save(any())).thenReturn(lockedAccount);

            assertThatCode(() -> accountService.setAccountStatus(11, true)).doesNotThrowAnyException();
            verify(taiKhoanRepository).save(argThat(tk -> tk.getTrangThai() == 1));
        }

        @Test
        @DisplayName("Thay đổi trạng thái thất bại: tài khoản không tồn tại")
        void setAccountStatus_notFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> accountService.setAccountStatus(999, false))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── resetPassword ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("resetPassword()")
    class ResetPasswordTests {

        @Test
        @DisplayName("Reset mật khẩu thành công")
        void resetPassword_success() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));
            when(passwordEncoder.encode("NewPass@2026")).thenReturn("newHash");
            when(taiKhoanRepository.save(any())).thenReturn(existingTaiKhoan);

            assertThatCode(() -> accountService.resetPassword(10, "NewPass@2026"))
                    .doesNotThrowAnyException();
            verify(taiKhoanRepository).save(argThat(tk -> "newHash".equals(tk.getMatKhauHash())));
        }

        @Test
        @DisplayName("Reset mật khẩu thất bại: mật khẩu mới dưới 8 ký tự")
        void resetPassword_tooShort_throwsBusinessException() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));

            assertThatThrownBy(() -> accountService.resetPassword(10, "short"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("8 ký tự");
        }

        @Test
        @DisplayName("Reset mật khẩu thất bại: mật khẩu null")
        void resetPassword_null_throwsBusinessException() {
            when(taiKhoanRepository.findById(10)).thenReturn(Optional.of(existingTaiKhoan));

            assertThatThrownBy(() -> accountService.resetPassword(10, null))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("8 ký tự");
        }

        @Test
        @DisplayName("Reset mật khẩu thất bại: tài khoản không tồn tại")
        void resetPassword_notFound_throwsResourceNotFound() {
            when(taiKhoanRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> accountService.resetPassword(999, "NewPass@123"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
