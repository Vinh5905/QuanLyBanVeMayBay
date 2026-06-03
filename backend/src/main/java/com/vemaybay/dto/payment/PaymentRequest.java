package com.vemaybay.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PaymentRequest {

    private Integer maPhieuDatCho;

    private Integer maVe;

    @NotBlank(message = "Hình thức thanh toán không được để trống")
    private String hinhThucThanhToan;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal soTienThanhToan;

    private String maGiaoDich;

    /**
     * Optional service payment type. Omit or use TICKET for the existing ticket/booking
     * payment flow handled by sp_ThanhToan_Create.
     */
    private String loaiThanhToan;

    private List<Integer> maGoiHanhLyList;

    private Integer maHangVeMoi;
}
