package com.vemaybay.service.impl;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.payment.PaymentRequest;
import com.vemaybay.dto.payment.PaymentResponse;
import com.vemaybay.dto.payment.PaymentSearchRequest;
import com.vemaybay.entity.ThanhToan;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.ThanhToanRepository;
import com.vemaybay.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final ThanhToanRepository thanhToanRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        if (request.getMaPhieuDatCho() == null && request.getMaVe() == null) {
            throw new BusinessException("MISSING_PAYMENT_TARGET",
                    "Phải cung cấp mã phiếu đặt chỗ hoặc mã vé");
        }
        if (request.getMaPhieuDatCho() != null && request.getMaVe() != null) {
            throw new BusinessException("DUPLICATE_PAYMENT_TARGET",
                    "Chỉ cung cấp một trong hai: mã phiếu đặt chỗ hoặc mã vé");
        }

        SpResult result = callSpThanhToan(request);
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }

        Integer maThanhToan = (Integer) result.data().get("MaThanhToan");
        ThanhToan tt = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", maThanhToan));
        return toResponse(tt);
    }

    @Override
    public PaymentResponse getPaymentById(Integer id) {
        ThanhToan tt = thanhToanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));
        return toResponse(tt);
    }

    @Override
    public ApiResponse<List<PaymentResponse>> getPayments(PaymentSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, sortParts[0]);

        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<ThanhToan> page = thanhToanRepository.findWithFilters(
                request.getMaVe(),
                request.getTrangThai(),
                pageRequest
        );

        List<PaymentResponse> data = page.getContent().stream().map(this::toResponse).toList();
        PaginationInfo pagination = PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.successWithPagination(data, pagination);
    }

    // ─── SP caller ──────────────────────────────────────────────────────────────

    private SpResult callSpThanhToan(PaymentRequest request) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_ThanhToan_Create(?, ?, ?, ?, ?, ?)}")) {
                if (request.getMaPhieuDatCho() != null) {
                    cs.setInt(1, request.getMaPhieuDatCho());
                    cs.setNull(2, Types.INTEGER);
                } else {
                    cs.setNull(1, Types.INTEGER);
                    cs.setInt(2, request.getMaVe());
                }
                cs.setString(3, request.getHinhThucThanhToan());
                cs.setBigDecimal(4, request.getSoTienThanhToan());
                if (request.getMaGiaoDich() != null) {
                    cs.setString(5, request.getMaGiaoDich());
                } else {
                    cs.setNull(5, Types.VARCHAR);
                }
                cs.registerOutParameter(6, Types.INTEGER);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs, "MaThanhToan", "GiaSauThue", "ThueVAT", "MaVe");
                }
            }
        });
    }

    private SpResult readSpResult(ResultSet rs, String... dataColumns) throws SQLException {
        if (rs == null || !rs.next()) {
            return SpResult.failure(-1, "Không nhận được kết quả từ stored procedure");
        }
        int errorCode = rs.getInt("ErrorCode");
        String message = rs.getString("Message");
        if (errorCode != 0) {
            return SpResult.failure(errorCode, message);
        }
        Map<String, Object> data = new HashMap<>();
        for (String col : dataColumns) {
            data.put(col, rs.getObject(col));
        }
        return SpResult.success(data, message);
    }

    private void throwFromSpError(int errorCode, String message) {
        switch (errorCode) {
            case 3002, 3005, 3006 -> throw new ResourceNotFoundException(message);
            case 3003, 3007 -> throw new BusinessException("INVALID_STATUS", message);
            case 3004 -> throw new BusinessException("PAYMENT_DEADLINE_PASSED", message);
            case 3008 -> throw new BusinessException("INSUFFICIENT_AMOUNT", message);
            default -> throw new BusinessException("SP_ERROR_" + errorCode, message);
        }
    }

    private PaymentResponse toResponse(ThanhToan tt) {
        return PaymentResponse.builder()
                .maThanhToan(tt.getMaThanhToan())
                .maVe(tt.getMaVe())
                .maPhieuDatCho(tt.getMaPhieuDatCho())
                .soTien(tt.getSoTien())
                .thueVAT(tt.getThueVAT())
                .phuongThuc(tt.getPhuongThuc())
                .trangThaiThanhToan(tt.getTrangThaiThanhToan())
                .maGiaoDich(tt.getMaGiaoDich())
                .thoiGianThanhToan(tt.getThoiGianThanhToan())
                .createdAt(tt.getCreatedAt())
                .build();
    }

    private record SpResult(int errorCode, String message, Map<String, Object> data) {
        boolean isSuccess() { return errorCode == 0; }
        static SpResult failure(int code, String msg) { return new SpResult(code, msg, null); }
        static SpResult success(Map<String, Object> data, String msg) { return new SpResult(0, msg, data); }
    }
}
