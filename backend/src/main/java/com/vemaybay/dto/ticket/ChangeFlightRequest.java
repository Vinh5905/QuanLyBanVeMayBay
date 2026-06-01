package com.vemaybay.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeFlightRequest {

    @NotNull(message = "Mã chuyến bay mới không được để trống")
    private Integer maChuyenBayMoi;
}
