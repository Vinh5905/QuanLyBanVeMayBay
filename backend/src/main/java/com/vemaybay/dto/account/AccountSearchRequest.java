package com.vemaybay.dto.account;

import lombok.Data;

@Data
public class AccountSearchRequest {

    private String vaiTro;
    private Integer trangThai;
    private String keyword;
    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
