package com.vemaybay.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {

    private Integer maThanhToan;
    private Integer maVe;
    private Integer maPhieuDatCho;
    private BigDecimal soTien;
    private BigDecimal thueVAT;
    private String phuongThuc;
    private String trangThaiThanhToan;
    private String maGiaoDich;
    private LocalDateTime thoiGianThanhToan;
    private LocalDateTime createdAt;
}
