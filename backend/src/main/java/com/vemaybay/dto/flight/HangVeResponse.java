package com.vemaybay.dto.flight;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class HangVeResponse {

    private Integer maHangVe;
    private String tenHangVe;
    private BigDecimal heSoGia;
    private String moTa;
}
