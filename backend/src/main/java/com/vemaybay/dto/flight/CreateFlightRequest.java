package com.vemaybay.dto.flight;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CreateFlightRequest {

    @NotBlank(message = "Mã chuyến bay không được để trống")
    private String maChuyenBayCode;

    @NotBlank(message = "Sân bay đi không được để trống")
    private String sanBayDi;

    @NotBlank(message = "Sân bay đến không được để trống")
    private String sanBayDen;

    @NotNull(message = "Ngày giờ bay không được để trống")
    @Future(message = "Ngày giờ bay phải lớn hơn thời điểm hiện tại")
    private LocalDateTime ngayGioBay;

    @NotNull(message = "Thời gian bay không được để trống")
    @Min(value = 30, message = "Thời gian bay tối thiểu 30 phút")
    private Integer thoiGianBay;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0", inclusive = false, message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal giaCoBan;

    @NotNull(message = "Danh sách hạng vé không được để trống")
    @Size(min = 1, message = "Phải có ít nhất 1 hạng vé")
    @Valid
    private List<HangVeInput> danhSachHangVe;

    @Valid
    private List<TrungGianInput> danhSachTrungGian;

    @Getter
    @Setter
    public static class HangVeInput {
        @NotNull(message = "Mã hạng vé không được để trống")
        private Integer maHangVe;

        @NotNull(message = "Số lượng ghế không được để trống")
        @Min(value = 1, message = "Số lượng ghế phải lớn hơn 0")
        private Integer soLuong;

        @NotNull(message = "Đơn giá không được để trống")
        @DecimalMin(value = "0", inclusive = false, message = "Đơn giá phải lớn hơn 0")
        private BigDecimal donGia;
    }

    @Getter
    @Setter
    public static class TrungGianInput {
        @NotBlank(message = "Mã sân bay trung gian không được để trống")
        private String maSanBay;

        @NotNull(message = "Thứ tự không được để trống")
        @Min(value = 1, message = "Thứ tự phải lớn hơn 0")
        private Integer thuTu;

        @NotNull(message = "Thời gian dừng không được để trống")
        @Min(value = 10, message = "Thời gian dừng tối thiểu 10 phút")
        @Max(value = 120, message = "Thời gian dừng tối đa 120 phút")
        private Integer thoiGianDung;

        private String ghiChu;
    }
}
