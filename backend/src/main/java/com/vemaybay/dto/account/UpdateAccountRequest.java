package com.vemaybay.dto.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAccountRequest {

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    private String tenDangNhap;
}
