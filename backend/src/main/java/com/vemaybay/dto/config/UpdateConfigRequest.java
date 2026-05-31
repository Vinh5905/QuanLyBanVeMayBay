package com.vemaybay.dto.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateConfigRequest {

    @NotBlank(message = "Giá trị không được để trống")
    @Size(max = 500, message = "Giá trị không được vượt quá 500 ký tự")
    private String giaTri;
}
