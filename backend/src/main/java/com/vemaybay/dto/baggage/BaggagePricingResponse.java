package com.vemaybay.dto.baggage;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BaggagePricingResponse {

    private Integer maBangGia;
    private String tenGoi;
    private BigDecimal trongLuongToiDa;
    private BigDecimal giaMuaTruoc;
    private BigDecimal giaTaiSanBay;
}
