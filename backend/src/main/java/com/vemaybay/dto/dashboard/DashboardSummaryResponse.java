package com.vemaybay.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardSummaryResponse {

    private Integer tongVeHomNay;
    private BigDecimal doanhThuHomNay;
    private Integer soChuyenBayHomNay;
    private Integer soKhachMoiThangNay;
}
