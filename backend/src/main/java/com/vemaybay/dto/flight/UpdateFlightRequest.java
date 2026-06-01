package com.vemaybay.dto.flight;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UpdateFlightRequest {

    @Future(message = "Ngày giờ bay phải lớn hơn thời điểm hiện tại")
    private LocalDateTime ngayGioBay;

    @Min(value = 30, message = "Thời gian bay tối thiểu 30 phút")
    private Integer thoiGianBay;

    @DecimalMin(value = "0", inclusive = false, message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal giaCoBan;

    private List<CreateFlightRequest.HangVeInput> danhSachHangVe;

    private List<CreateFlightRequest.TrungGianInput> danhSachTrungGian;
}
