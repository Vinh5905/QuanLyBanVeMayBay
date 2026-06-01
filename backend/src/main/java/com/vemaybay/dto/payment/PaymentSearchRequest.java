package com.vemaybay.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentSearchRequest {

    private Integer maVe;
    private String trangThai;
    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
