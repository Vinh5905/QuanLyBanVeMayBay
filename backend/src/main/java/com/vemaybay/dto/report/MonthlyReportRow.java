package com.vemaybay.dto.report;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MonthlyReportRow {

    private Integer maChuyenBay;
    private String maChuyenBayCode;
    private String sanBayDi;
    private String sanBayDen;
    private LocalDateTime ngayGioBay;
    private BigDecimal doanhThuVe;
    private BigDecimal doanhThuHanhLy;
    private Integer soVeBan;
    private Double phanTramTrenTong;
}
