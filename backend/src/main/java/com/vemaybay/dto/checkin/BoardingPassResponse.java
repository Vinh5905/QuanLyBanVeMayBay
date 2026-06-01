package com.vemaybay.dto.checkin;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoardingPassResponse {

    private Integer maCheckIn;
    private String boardingPassCode;
    private String soGhe;
    private String trangThai;
    private LocalDateTime checkInAt;

    private TicketInfo ve;
    private PassengerInfo hanhKhach;
    private FlightInfo chuyenBay;

    @Getter
    @Builder
    public static class TicketInfo {
        private Integer maVe;
        private String maVeCode;
        private String trangThaiVe;
        private String hangVe;
    }

    @Getter
    @Builder
    public static class PassengerInfo {
        private String hoTen;
        private String cccd;
        private String email;
    }

    @Getter
    @Builder
    public static class FlightInfo {
        private String maChuyenBayCode;
        private String sanBayDi;
        private String tenSanBayDi;
        private String sanBayDen;
        private String tenSanBayDen;
        private LocalDateTime ngayGioBay;
    }
}
