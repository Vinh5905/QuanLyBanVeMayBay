package com.vemaybay.dto.baggage;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BaggageResponse {

    private Integer maGoiHanhLy;
    private Integer maVe;
    private PricingInfo bangGia;
    private BigDecimal tongTrongLuong;
    private BigDecimal tongPhi;
    private String trangThai;
    private List<PieceInfo> danhSachKien;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    public static class PricingInfo {
        private Integer maBangGia;
        private String tenGoi;
        private BigDecimal trongLuongToiDa;
        private BigDecimal giaMuaTruoc;
        private BigDecimal giaTaiSanBay;
    }

    @Getter
    @Builder
    public static class PieceInfo {
        private Integer maKienHanhLy;
        private String maTheHanhLy;
        private BigDecimal trongLuong;
        private String ghiChu;
    }
}
