package com.vemaybay.dto.ticket;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketSearchRequest {

    private Integer maKhachHang;
    private Integer maChuyenBay;
    private String trangThaiVe;
    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
