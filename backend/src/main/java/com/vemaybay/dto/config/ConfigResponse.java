package com.vemaybay.dto.config;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ConfigResponse {

    private String tenThamSo;
    private String giaTri;
    private String moTa;
    private LocalDateTime capNhatLuc;
    private Integer capNhatBoi;
}
