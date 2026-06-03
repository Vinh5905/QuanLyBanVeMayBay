package com.vemaybay.dto.profile;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(max = 150)
    private String hoTen;

    @Size(max = 20)
    private String soDienThoai;

    @Size(max = 20)
    private String cccd;

    private LocalDate ngaySinh;
}
