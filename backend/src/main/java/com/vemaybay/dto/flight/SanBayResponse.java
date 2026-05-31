package com.vemaybay.dto.flight;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SanBayResponse {

    private String maSanBay;
    private String tenSanBay;
    private String thanhPho;
    private String quocGia;
}
