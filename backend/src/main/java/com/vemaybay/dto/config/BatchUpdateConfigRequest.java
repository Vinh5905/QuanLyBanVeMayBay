package com.vemaybay.dto.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

@Data
public class BatchUpdateConfigRequest {

    @NotEmpty(message = "Danh sách tham số không được để trống")
    private Map<String, String> thamSo;
}
