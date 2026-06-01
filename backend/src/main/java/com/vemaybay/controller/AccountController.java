package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.account.AccountResponse;
import com.vemaybay.dto.account.AccountSearchRequest;
import com.vemaybay.dto.account.CreateAccountRequest;
import com.vemaybay.dto.account.UpdateAccountRequest;
import com.vemaybay.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Admin')")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(
            AccountSearchRequest request) {
        return ResponseEntity.ok(accountService.getAccounts(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tạo tài khoản thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAccountRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(accountService.updateAccount(id, request), "Cập nhật tài khoản thành công"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setAccountStatus(
            @PathVariable Integer id,
            @RequestParam boolean active) {
        accountService.setAccountStatus(id, active);
        String msg = active ? "Tài khoản đã được mở khóa" : "Tài khoản đã bị khóa";
        return ResponseEntity.ok(ApiResponse.success(null, msg));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String newPassword = body.get("matKhauMoi");
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Mật khẩu mới phải có ít nhất 8 ký tự"));
        }
        accountService.resetPassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công"));
    }
}
