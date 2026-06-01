package com.vemaybay.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpgradeRequest {

    @NotNull(message = "Mã hạng vé mới không được để trống")
    private Integer maHangVeMoi;
}
