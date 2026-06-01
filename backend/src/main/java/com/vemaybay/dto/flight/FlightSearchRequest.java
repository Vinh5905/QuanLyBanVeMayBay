package com.vemaybay.dto.flight;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class FlightSearchRequest {

    private String sanBayDi;
    private String sanBayDen;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate ngayBay;

    private String trangThai;
    private int page = 0;
    private int size = 20;
    private String sort = "ngayGioBay,asc";
}
