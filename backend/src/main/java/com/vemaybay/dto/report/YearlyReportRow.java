package com.vemaybay.dto.report;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class YearlyReportRow {

    private Integer thang;
    private Integer soChuyenBay;
    private Integer soVe;
    private BigDecimal doanhThu;
    private Double phanTram;
}
