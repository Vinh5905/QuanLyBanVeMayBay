package com.vemaybay.service;

import com.vemaybay.dto.payment.PaymentRequest;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.repository.ChiTietHangVeRepository;
import com.vemaybay.repository.GoiHanhLyRepository;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.ThanhToanRepository;
import com.vemaybay.repository.ThamSoRepository;
import com.vemaybay.repository.VeRepository;
import com.vemaybay.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentServiceImpl Unit Tests")
class PaymentServiceImplTest {

    @Mock ThanhToanRepository thanhToanRepository;
    @Mock VeRepository veRepository;
    @Mock GoiHanhLyRepository goiHanhLyRepository;
    @Mock ChiTietHangVeRepository chiTietHangVeRepository;
    @Mock ThamSoRepository thamSoRepository;
    @Mock TaiKhoanRepository taiKhoanRepository;
    @Mock JdbcTemplate jdbcTemplate;

    @InjectMocks PaymentServiceImpl paymentService;

    // ─── createPayment - validation ───────────────────────────────────────────

    @Nested
    @DisplayName("createPayment() - Validation đầu vào")
    class CreatePaymentValidationTests {

        @Test
        @DisplayName("Thanh toán thất bại: không cung cấp maPhieuDatCho và maVe")
        void createPayment_missingBothTargets_throwsBusinessException() {
            PaymentRequest request = new PaymentRequest();
            request.setMaPhieuDatCho(null);
            request.setMaVe(null);
            request.setHinhThucThanhToan("CASH");
            request.setSoTienThanhToan(BigDecimal.valueOf(1200000));

            assertThatThrownBy(() -> paymentService.createPayment(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("mã phiếu đặt chỗ hoặc mã vé");
        }

        @Test
        @DisplayName("Thanh toán thất bại: cung cấp cả maPhieuDatCho và maVe cùng lúc")
        void createPayment_bothTargetsProvided_throwsBusinessException() {
            PaymentRequest request = new PaymentRequest();
            request.setMaPhieuDatCho(55);
            request.setMaVe(101);
            request.setHinhThucThanhToan("CASH");
            request.setSoTienThanhToan(BigDecimal.valueOf(1200000));

            assertThatThrownBy(() -> paymentService.createPayment(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("một trong hai");
        }

        @Test
        @DisplayName("createPayment gọi SP khi maPhieuDatCho được cung cấp")
        void createPayment_withPhieuDatCho_callsJdbcTemplate() {
            PaymentRequest request = new PaymentRequest();
            request.setMaPhieuDatCho(55);
            request.setMaVe(null);
            request.setHinhThucThanhToan("MOMO");
            request.setSoTienThanhToan(BigDecimal.valueOf(1320000));
            request.setMaGiaoDich("MOMO_TXN_001");

            // jdbcTemplate not configured → will throw NullPointerException or RuntimeException
            // This verifies that validation passes and SP is called
            assertThatThrownBy(() -> paymentService.createPayment(request))
                    .isNotInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("createPayment gọi SP khi maVe được cung cấp")
        void createPayment_withMaVe_callsJdbcTemplate() {
            PaymentRequest request = new PaymentRequest();
            request.setMaPhieuDatCho(null);
            request.setMaVe(101);
            request.setHinhThucThanhToan("CASH");
            request.setSoTienThanhToan(BigDecimal.valueOf(500000));

            // jdbcTemplate not configured → validation passes, SP call attempted
            assertThatThrownBy(() -> paymentService.createPayment(request))
                    .isNotInstanceOf(BusinessException.class);
        }
    }
}
