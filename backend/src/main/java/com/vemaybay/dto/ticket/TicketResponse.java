package com.vemaybay.dto.ticket;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TicketResponse {

    private Integer maVe;
    private String maVeCode;
    private FlightInfo chuyenBay;
    private ClassInfo hangVe;
    private CustomerInfo khachHang;
    private BigDecimal giaVe;
    private String trangThaiVe;
    private Integer maPhieuDatCho;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    public static class FlightInfo {
        private Integer maChuyenBay;
        private String maChuyenBayCode;
        private String sanBayDi;
        private String tenSanBayDi;
        private String sanBayDen;
        private String tenSanBayDen;
        private LocalDateTime ngayGioBay;
    }

    @Getter
    @Builder
    public static class ClassInfo {
        private Integer maHangVe;
        private String tenHangVe;
        private BigDecimal donGia;
    }

    @Getter
    @Builder
    public static class CustomerInfo {
        private Integer maKhachHang;
        private String hoTen;
        private String email;
        private String soDienThoai;
        private String cccd;
    }
}
