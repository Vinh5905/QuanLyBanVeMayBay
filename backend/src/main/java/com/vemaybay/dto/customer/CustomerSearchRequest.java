package com.vemaybay.dto.customer;

import lombok.Data;

@Data
public class CustomerSearchRequest {

    private String keyword;
    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
