package com.vemaybay.dto.flight;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class FlightResponse {

    private Integer maChuyenBay;
    private String maChuyenBayCode;
    private SanBayInfo sanBayDi;
    private SanBayInfo sanBayDen;
    private LocalDateTime ngayGioBay;
    private Integer thoiGianBay;
    private BigDecimal giaCoBan;
    private String trangThaiChuyenBay;
    private List<HangVeInfo> danhSachHangVe;
    private List<TrungGianInfo> danhSachTrungGian;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    public static class SanBayInfo {
        private String maSanBay;
        private String tenSanBay;
        private String thanhPho;
    }

    @Getter
    @Builder
    public static class HangVeInfo {
        private Integer maHangVe;
        private String tenHangVe;
        private Integer soLuong;
        private Integer soGheDaDat;
        private Integer soGheCon;
        private BigDecimal donGia;
    }

    @Getter
    @Builder
    public static class TrungGianInfo {
        private String maSanBay;
        private String tenSanBay;
        private String thanhPho;
        private Integer thuTu;
        private Integer thoiGianDung;
        private String ghiChu;
    }
}
