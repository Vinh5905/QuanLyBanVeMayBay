package com.vemaybay.dto.checkin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckInRequest {

    @NotNull(message = "Mã vé không được để trống")
    private Integer maVe;

    @NotBlank(message = "Số ghế không được để trống")
    private String soGhe;
}
