package com.vemaybay.service.impl;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.payment.PaymentRequest;
import com.vemaybay.dto.payment.PaymentResponse;
import com.vemaybay.entity.ChiTietHangVe;
import com.vemaybay.entity.ChiTietHangVeId;
import com.vemaybay.entity.GoiHanhLy;
import com.vemaybay.dto.payment.PaymentSearchRequest;
import com.vemaybay.entity.ThanhToan;
import com.vemaybay.entity.Ve;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ForbiddenException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.GoiHanhLyRepository;
import com.vemaybay.repository.ChiTietHangVeRepository;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.ThanhToanRepository;
import com.vemaybay.repository.ThamSoRepository;
import com.vemaybay.repository.VeRepository;
import com.vemaybay.security.SecurityUtils;
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
import java.math.RoundingMode;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final ThanhToanRepository thanhToanRepository;
    private final VeRepository veRepository;
    private final GoiHanhLyRepository goiHanhLyRepository;
    private final ChiTietHangVeRepository chiTietHangVeRepository;
    private final ThamSoRepository thamSoRepository;
    private final TaiKhoanRepository taiKhoanRepository;
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

        if (isServicePayment(request)) {
            return createServicePayment(request);
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

    private boolean isServicePayment(PaymentRequest request) {
        String type = normalizePaymentType(request.getLoaiThanhToan());
        return request.getMaVe() != null
                && request.getMaPhieuDatCho() == null
                && type != null
                && !"TICKET".equals(type);
    }

    private PaymentResponse createServicePayment(PaymentRequest request) {
        String type = normalizePaymentType(request.getLoaiThanhToan());
        if (!Set.of("BAGGAGE", "UPGRADE", "SERVICE").contains(type)) {
            throw new BusinessException("INVALID_PAYMENT_TYPE", "Loại thanh toán dịch vụ không hợp lệ: " + type);
        }
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(request.getMaVe())
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", request.getMaVe()));

        ensureCanPayTicket(ve);

        if (!"HOP_LE".equals(ve.getTrangThaiVe())) {
            throw new BusinessException("INVALID_TICKET_STATUS",
                    "Chỉ có thể thanh toán dịch vụ cho vé HOP_LE. Trạng thái hiện tại: "
                            + ve.getTrangThaiVe());
        }

        BigDecimal vatRate = getVatRate();
        BigDecimal amount = money(request.getSoTienThanhToan());

        if ("BAGGAGE".equals(type)) {
            List<GoiHanhLy> targets = resolveBaggageTargets(request);
            BigDecimal baseTotal = targets.stream()
                    .map(GoiHanhLy::getTongPhi)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal required = addVat(baseTotal, vatRate);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("INSUFFICIENT_AMOUNT",
                        "Số tiền không đủ. Yêu cầu: " + required);
            }
            amount = required;
            targets.forEach(goi -> {
                goi.setDaThanhToan(true);
                goi.setTrangThai("ACTIVE");
            });
            goiHanhLyRepository.saveAll(targets);
        } else if ("UPGRADE".equals(type)) {
            UpgradePricing upgradePricing = applyUpgrade(ve, request.getMaHangVeMoi());
            BigDecimal required = addVat(upgradePricing.delta(), vatRate);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("INSUFFICIENT_AMOUNT",
                        "Số tiền không đủ. Yêu cầu: " + required);
            }
            amount = required;
        }

        ThanhToan payment = ThanhToan.builder()
                .maVe(request.getMaVe())
                .soTien(amount)
                .thueVAT(extractVat(amount, vatRate))
                .phuongThuc(request.getHinhThucThanhToan())
                .trangThaiThanhToan("COMPLETED")
                .maGiaoDich(request.getMaGiaoDich())
                .thoiGianThanhToan(LocalDateTime.now())
                .build();

        return toResponse(thanhToanRepository.save(payment));
    }

    private List<GoiHanhLy> resolveBaggageTargets(PaymentRequest request) {
        List<Integer> ids = request.getMaGoiHanhLyList();
        List<GoiHanhLy> packages;
        if (ids != null && !ids.isEmpty()) {
            packages = goiHanhLyRepository.findByMaGoiHanhLyIn(ids);
            Set<Integer> uniqueIds = new HashSet<>(ids);
            if (packages.size() != uniqueIds.size()) {
                throw new ResourceNotFoundException("Gói hành lý", "id", ids.toString());
            }
        } else {
            packages = goiHanhLyRepository
                    .findByMaVeAndTrangThaiNotAndDaThanhToanFalse(request.getMaVe(), "CANCELLED");
        }

        if (packages.isEmpty()) {
            throw new BusinessException("NO_UNPAID_BAGGAGE", "Không có gói hành lý chờ thanh toán");
        }

        for (GoiHanhLy goi : packages) {
            if (!request.getMaVe().equals(goi.getMaVe())) {
                throw new ForbiddenException("Gói hành lý không thuộc vé cần thanh toán");
            }
            if ("CANCELLED".equals(goi.getTrangThai())) {
                throw new BusinessException("BAGGAGE_CANCELLED", "Gói hành lý đã bị hủy");
            }
            if (Boolean.TRUE.equals(goi.getDaThanhToan())) {
                throw new BusinessException("BAGGAGE_ALREADY_PAID", "Gói hành lý đã được thanh toán");
            }
        }
        return packages;
    }

    private UpgradePricing applyUpgrade(Ve ve, Integer maHangVeMoi) {
        if (maHangVeMoi == null) {
            throw new BusinessException("MISSING_UPGRADE_CLASS", "Phải chọn hạng vé mới để nâng hạng");
        }
        if (ve.getMaHangVe().equals(maHangVeMoi)) {
            throw new BusinessException("SAME_CLASS", "Hạng vé mới phải khác hạng vé hiện tại");
        }

        ChiTietHangVe oldCt = chiTietHangVeRepository
                .findById(new ChiTietHangVeId(ve.getMaChuyenBay(), ve.getMaHangVe()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chi tiết hạng vé cũ", "id", ve.getMaHangVe()));

        ChiTietHangVe newCt = chiTietHangVeRepository
                .findById(new ChiTietHangVeId(ve.getMaChuyenBay(), maHangVeMoi))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hạng vé mới không tồn tại trên chuyến bay này"));

        BigDecimal delta = newCt.getDonGia().subtract(ve.getGiaVe());
        if (delta.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("INVALID_UPGRADE_CLASS",
                    "Chỉ có thể nâng lên hạng có giá cao hơn hạng hiện tại");
        }
        if (newCt.getSoLuong() - newCt.getSoGheDaDat() <= 0) {
            throw new ConflictException("SEAT_UNAVAILABLE", "Hết ghế cho hạng vé mới");
        }

        oldCt.setSoGheDaDat(oldCt.getSoGheDaDat() - 1);
        newCt.setSoGheDaDat(newCt.getSoGheDaDat() + 1);
        chiTietHangVeRepository.save(oldCt);
        chiTietHangVeRepository.save(newCt);

        ve.setMaHangVe(maHangVeMoi);
        ve.setGiaVe(newCt.getDonGia());
        veRepository.save(ve);

        return new UpgradePricing(delta);
    }

    private void ensureCanPayTicket(Ve ve) {
        if (!SecurityUtils.isUser()) {
            return;
        }
        Integer userId = SecurityUtils.getCurrentUserId();
        Integer maKhachHang = taiKhoanRepository.findById(userId)
                .map(tk -> tk.getMaKhachHang())
                .orElse(null);
        if (maKhachHang == null || !maKhachHang.equals(ve.getMaKhachHang())) {
            throw new ForbiddenException("Bạn không có quyền thanh toán cho vé này");
        }
    }

    private String normalizePaymentType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        return type.trim().toUpperCase();
    }

    private BigDecimal getVatRate() {
        return thamSoRepository.findById("ThueVAT")
                .map(ts -> {
                    try {
                        return new BigDecimal(ts.getGiaTri().trim())
                                .divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
                    } catch (RuntimeException ex) {
                        return new BigDecimal("0.10");
                    }
                })
                .orElse(new BigDecimal("0.10"));
    }

    private BigDecimal addVat(BigDecimal baseAmount, BigDecimal vatRate) {
        return money(baseAmount.multiply(BigDecimal.ONE.add(vatRate)));
    }

    private BigDecimal extractVat(BigDecimal amountAfterTax, BigDecimal vatRate) {
        if (vatRate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal base = amountAfterTax.divide(BigDecimal.ONE.add(vatRate), 2, RoundingMode.HALF_UP);
        return money(amountAfterTax.subtract(base));
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record UpgradePricing(BigDecimal delta) {}

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
