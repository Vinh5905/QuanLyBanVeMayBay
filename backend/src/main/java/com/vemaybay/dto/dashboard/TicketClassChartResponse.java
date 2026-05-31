package com.vemaybay.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TicketClassChartResponse {

    private String hangVe;
    private Long soLuong;
    private Double phanTram;
}
