package com.vemaybay.service.impl;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.account.AccountResponse;
import com.vemaybay.dto.account.AccountSearchRequest;
import com.vemaybay.dto.account.CreateAccountRequest;
import com.vemaybay.dto.account.UpdateAccountRequest;
import com.vemaybay.entity.TaiKhoan;
import com.vemaybay.entity.VaiTro;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.VaiTroRepository;
import com.vemaybay.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse<List<AccountResponse>> getAccounts(AccountSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, sortParts[0]);
        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);

        Byte trangThai = request.getTrangThai() != null ? request.getTrangThai().byteValue() : null;
        String keyword = request.getKeyword() != null && !request.getKeyword().isBlank()
                ? request.getKeyword().trim() : null;

        Page<TaiKhoan> page = taiKhoanRepository.findWithFilters(
                request.getVaiTro(), trangThai, keyword, pageRequest);

        List<AccountResponse> data = page.getContent().stream()
                .map(this::toResponse).toList();

        return ApiResponse.successWithPagination(data, PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build());
    }

    @Override
    public AccountResponse getAccountById(Integer id) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", id));
        return toResponse(tk);
    }

    @Override
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        if (taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new ConflictException("DUPLICATE_USERNAME", "Tên đăng nhập đã tồn tại: " + request.getTenDangNhap());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("DUPLICATE_EMAIL", "Email đã được sử dụng: " + request.getEmail());
        }

        VaiTro vaiTro = vaiTroRepository.findByTenVaiTro(request.getVaiTro())
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "tên", request.getVaiTro()));

        TaiKhoan tk = TaiKhoan.builder()
                .tenDangNhap(request.getTenDangNhap())
                .matKhauHash(passwordEncoder.encode(request.getMatKhau()))
                .vaiTro(vaiTro)
                .email(request.getEmail())
                .trangThai((byte) 1)
                .build();

        return toResponse(taiKhoanRepository.save(tk));
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(Integer id, UpdateAccountRequest request) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", id));

        if (request.getTenDangNhap() != null && !request.getTenDangNhap().isBlank()) {
            if (!request.getTenDangNhap().equals(tk.getTenDangNhap())
                    && taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
                throw new ConflictException("DUPLICATE_USERNAME", "Tên đăng nhập đã tồn tại");
            }
            tk.setTenDangNhap(request.getTenDangNhap());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(tk.getEmail())
                    && taiKhoanRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("DUPLICATE_EMAIL", "Email đã được sử dụng");
            }
            tk.setEmail(request.getEmail());
        }

        return toResponse(taiKhoanRepository.save(tk));
    }

    @Override
    @Transactional
    public void setAccountStatus(Integer id, boolean active) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", id));
        tk.setTrangThai(active ? (byte) 1 : (byte) 0);
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void resetPassword(Integer id, String newPassword) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", id));
        if (newPassword == null || newPassword.length() < 8) {
            throw new BusinessException("INVALID_PASSWORD", "Mật khẩu mới phải có ít nhất 8 ký tự");
        }
        tk.setMatKhauHash(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(tk);
    }

    private AccountResponse toResponse(TaiKhoan tk) {
        return AccountResponse.builder()
                .maTaiKhoan(tk.getMaTaiKhoan())
                .tenDangNhap(tk.getTenDangNhap())
                .email(tk.getEmail())
                .vaiTro(tk.getVaiTro() != null ? tk.getVaiTro().getTenVaiTro() : null)
                .maVaiTro(tk.getVaiTro() != null ? tk.getVaiTro().getMaVaiTro() : null)
                .maKhachHang(tk.getMaKhachHang())
                .trangThai(tk.getTrangThai() != null ? tk.getTrangThai().intValue() : null)
                .createdAt(tk.getCreatedAt())
                .lastLogin(tk.getLastLogin())
                .build();
    }
}
