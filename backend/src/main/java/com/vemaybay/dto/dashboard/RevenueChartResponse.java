package com.vemaybay.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class RevenueChartResponse {

    private LocalDate ngay;
    private BigDecimal doanhThu;
}
