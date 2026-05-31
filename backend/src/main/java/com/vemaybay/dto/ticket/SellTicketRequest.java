package com.vemaybay.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellTicketRequest {

    @NotNull(message = "Mã chuyến bay không được để trống")
    private Integer maChuyenBay;

    @NotNull(message = "Mã khách hàng không được để trống")
    private Integer maKhachHang;

    @NotNull(message = "Mã hạng vé không được để trống")
    private Integer maHangVe;
}
