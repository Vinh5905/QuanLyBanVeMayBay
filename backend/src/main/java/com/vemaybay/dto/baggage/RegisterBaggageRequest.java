package com.vemaybay.dto.baggage;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class RegisterBaggageRequest {

    @NotNull(message = "Mã vé không được để trống")
    private Integer maVe;

    @NotNull(message = "Mã bảng giá không được để trống")
    private Integer maBangGia;

    @NotEmpty(message = "Danh sách kiện hành lý không được rỗng")
    @Size(max = 15, message = "Tối đa 15 kiện hành lý")
    @Valid
    private List<KienInput> danhSachKien;

    @Getter
    @Setter
    public static class KienInput {

        @NotNull(message = "Trọng lượng không được để trống")
        @DecimalMin(value = "0.1", message = "Trọng lượng phải lớn hơn 0")
        @DecimalMax(value = "32.0", message = "Mỗi kiện tối đa 32kg")
        private BigDecimal trongLuong;

        private String ghiChu;
    }
}
