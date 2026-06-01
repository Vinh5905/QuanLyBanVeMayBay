package com.vemaybay.dto.ticket;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {

    private Integer maPhieuDatCho;
    private TicketResponse ve;
    private BigDecimal tongTien;
    private String trangThaiDatCho;
    private LocalDateTime hanThanhToan;
    private LocalDateTime createdAt;
}
