package com.vemaybay.service.impl;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.ticket.*;
import com.vemaybay.entity.*;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ForbiddenException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.*;
import com.vemaybay.security.SecurityUtils;
import com.vemaybay.service.TicketService;
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
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final VeRepository veRepository;
    private final PhieuDatChoRepository phieuDatChoRepository;
    private final KhachHangRepository khachHangRepository;
    private final ChiTietHangVeRepository chiTietHangVeRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public TicketResponse sellTicket(SellTicketRequest request) {
        SpResult result = callSpBanVe(
                request.getMaChuyenBay(),
                request.getMaKhachHang(),
                request.getMaHangVe()
        );
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }
        Integer maVe = (Integer) result.data().get("MaVe");
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(maVe)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", maVe));
        return toTicketResponse(ve);
    }

    @Override
    @Transactional
    public BookingResponse bookTicket(BookTicketRequest request) {
        Integer maKhachHang = resolveCurrentKhachHang();
        SpResult result = callSpDatVe(
                request.getMaChuyenBay(),
                maKhachHang,
                request.getMaHangVe()
        );
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }
        Integer maPhieuDat = (Integer) result.data().get("MaPhieuDat");
        Integer maVe = (Integer) result.data().get("MaVe");

        PhieuDatCho phieu = phieuDatChoRepository.findById(maPhieuDat)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu đặt chỗ", "id", maPhieuDat));
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(maVe)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", maVe));

        return toBookingResponse(phieu, ve);
    }

    @Override
    public ApiResponse<List<TicketResponse>> getTickets(TicketSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, sortParts[0]);

        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<Ve> page = veRepository.findWithFilters(
                request.getMaKhachHang(),
                request.getMaChuyenBay(),
                request.getTrangThaiVe(),
                pageRequest
        );

        List<TicketResponse> data = page.getContent().stream().map(this::toTicketResponse).toList();
        PaginationInfo pagination = PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.successWithPagination(data, pagination);
    }

    @Override
    public List<TicketResponse> getMyTickets() {
        Integer maKhachHang = resolveCurrentKhachHang();
        return veRepository.findByMaKhachHangAndIsDeletedFalse(maKhachHang)
                .stream().map(this::toTicketResponse).toList();
    }

    @Override
    public TicketResponse getTicketById(Integer id) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", id));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!ve.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền xem vé này");
            }
        }
        return toTicketResponse(ve);
    }

    @Override
    public TicketResponse getTicketByCode(String maVeCode) {
        if (maVeCode == null || maVeCode.isBlank()) {
            throw new BusinessException("INVALID_TICKET_CODE", "Mã vé không được để trống");
        }

        Ve ve = veRepository.findByMaVeCodeIgnoreCaseAndIsDeletedFalse(maVeCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "mã vé", maVeCode));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!ve.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền xem vé này");
            }
        }
        return toTicketResponse(ve);
    }

    @Override
    @Transactional
    public TicketResponse changeFlight(Integer id, ChangeFlightRequest request) {
        Ve currentVe = veRepository.findByMaVeAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", id));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!currentVe.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền đổi chuyến vé này");
            }
        }

        SpResult result = callSpDoiChuyenBay(id, request.getMaChuyenBayMoi());
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", id));
        return toTicketResponse(ve);
    }

    @Override
    @Transactional
    public TicketResponse upgrade(Integer id, UpgradeRequest request) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", id));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!ve.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền nâng hạng vé này");
            }
        }

        if (!"HOP_LE".equals(ve.getTrangThaiVe())) {
            throw new BusinessException("INVALID_TICKET_STATUS",
                    "Chỉ có thể nâng hạng vé ở trạng thái HOP_LE. Trạng thái hiện tại: " + ve.getTrangThaiVe());
        }
        if (ve.getMaHangVe().equals(request.getMaHangVeMoi())) {
            throw new BusinessException("SAME_CLASS", "Hạng vé mới phải khác hạng vé hiện tại");
        }

        ChiTietHangVe oldCt = chiTietHangVeRepository
                .findById(new ChiTietHangVeId(ve.getMaChuyenBay(), ve.getMaHangVe()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chi tiết hạng vé cũ", "id", ve.getMaHangVe()));

        ChiTietHangVe newCt = chiTietHangVeRepository
                .findById(new ChiTietHangVeId(ve.getMaChuyenBay(), request.getMaHangVeMoi()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hạng vé mới không tồn tại trên chuyến bay này"));

        if (newCt.getSoLuong() - newCt.getSoGheDaDat() <= 0) {
            throw new ConflictException("SEAT_UNAVAILABLE", "Hết ghế cho hạng vé mới");
        }

        oldCt.setSoGheDaDat(oldCt.getSoGheDaDat() - 1);
        newCt.setSoGheDaDat(newCt.getSoGheDaDat() + 1);
        chiTietHangVeRepository.save(oldCt);
        chiTietHangVeRepository.save(newCt);

        ve.setMaHangVe(request.getMaHangVeMoi());
        ve.setGiaVe(newCt.getDonGia());
        veRepository.save(ve);

        return toTicketResponse(veRepository.findByMaVeAndIsDeletedFalse(id).orElseThrow());
    }

    @Override
    @Transactional
    public void cancelTicket(Integer id) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", id));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!ve.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền hủy vé này");
            }
        }

        SpResult result = callSpHuyVe(id);
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }
    }

    @Override
    public ApiResponse<List<BookingResponse>> getBookings(TicketSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, sortParts[0]);

        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<PhieuDatCho> page = phieuDatChoRepository.findWithFilters(
                request.getMaKhachHang(),
                request.getMaChuyenBay(),
                request.getTrangThaiVe(),
                pageRequest
        );

        List<BookingResponse> data = page.getContent().stream()
                .map(p -> toBookingResponse(p, null))
                .toList();
        PaginationInfo pagination = PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.successWithPagination(data, pagination);
    }

    @Override
    public List<BookingResponse> getMyBookings() {
        Integer maKhachHang = resolveCurrentKhachHang();
        return phieuDatChoRepository
                .findByMaKhachHangAndTrangThaiDatChoNot(maKhachHang, "DA_HUY")
                .stream()
                .map(p -> toBookingResponse(p, null))
                .toList();
    }

    @Override
    @Transactional
    public void cancelBooking(Integer id) {
        PhieuDatCho phieu = phieuDatChoRepository
                .findByMaPhieuDatChoAndTrangThaiDatChoNot(id, "DA_HUY")
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu đặt chỗ", "id", id));

        if (SecurityUtils.isUser()) {
            Integer maKhachHang = resolveCurrentKhachHang();
            if (!phieu.getMaKhachHang().equals(maKhachHang)) {
                throw new ForbiddenException("Bạn không có quyền hủy phiếu đặt chỗ này");
            }
        }

        if (!"DANG_GIU_CHO".equals(phieu.getTrangThaiDatCho()) && !"PENDING".equals(phieu.getTrangThaiDatCho())) {
            throw new BusinessException("INVALID_BOOKING_STATUS",
                    "Chỉ có thể hủy phiếu đặt chỗ ở trạng thái DANG_GIU_CHO");
        }

        // find the linked Ve (DANG_GIU_CHO) and cancel it via SP to release the seat
        veRepository.findAll().stream()
                .filter(v -> id.equals(v.getMaPhieuDatCho()) && !Boolean.TRUE.equals(v.getIsDeleted())
                        && "DANG_GIU_CHO".equals(v.getTrangThaiVe()))
                .findFirst()
                .ifPresent(ve -> {
                    // cancel directly to keep booking cancellation independent from SP state rules
                    ve.setTrangThaiVe("DA_HUY");
                    ve.setIsDeleted(true);
                    veRepository.save(ve);

                    ChiTietHangVe ct = chiTietHangVeRepository
                            .findById(new ChiTietHangVeId(ve.getMaChuyenBay(), ve.getMaHangVe()))
                            .orElse(null);
                    if (ct != null) {
                        ct.setSoGheDaDat(Math.max(0, ct.getSoGheDaDat() - 1));
                        chiTietHangVeRepository.save(ct);
                    }
                });

        phieu.setTrangThaiDatCho("DA_HUY");
        phieuDatChoRepository.save(phieu);
    }

    // ─── SP callers ────────────────────────────────────────────────────────────

    private SpResult callSpBanVe(int maChuyenBay, int maKhachHang, int maHangVe) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_BanVe_Create(?, ?, ?, ?, ?)}")) {
                cs.setInt(1, maChuyenBay);
                cs.setInt(2, maKhachHang);
                cs.setInt(3, maHangVe);
                cs.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
                cs.registerOutParameter(5, Types.INTEGER);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs, "MaVe", "MaVeCode", "GiaVe");
                }
            }
        });
    }

    private SpResult callSpDatVe(int maChuyenBay, int maKhachHang, int maHangVe) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_DatVe_Create(?, ?, ?, ?)}")) {
                cs.setInt(1, maChuyenBay);
                cs.setInt(2, maKhachHang);
                cs.setInt(3, maHangVe);
                cs.registerOutParameter(4, Types.INTEGER);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs, "MaPhieuDat", "MaVe", "MaVeCode", "HanThanhToan");
                }
            }
        });
    }

    private SpResult callSpHuyVe(int maVe) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_HuyVe(?, ?, ?)}")) {
                cs.setInt(1, maVe);
                cs.setNull(2, Types.INTEGER);
                cs.setNull(3, Types.NVARCHAR);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs);
                }
            }
        });
    }

    private SpResult callSpDoiChuyenBay(int maVe, int maChuyenBayMoi) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_DoiChuyenBay(?, ?)}")) {
                cs.setInt(1, maVe);
                cs.setInt(2, maChuyenBayMoi);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs, "MaVe", "MaChuyenBayMoi", "GiaVeMoi");
                }
            }
        });
    }

    // ─── SP result helpers ──────────────────────────────────────────────────────

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
            case 1001, 1003, 1004, 2001, 2003, 2004, 4001, 5001, 5004, 5006 ->
                    throw new ResourceNotFoundException(message);
            case 1005, 2005, 5007 ->
                    throw new ConflictException("SEAT_UNAVAILABLE", message);
            case 1002, 2002 ->
                    throw new BusinessException("BOOKING_DEADLINE_PASSED", message);
            case 4002, 5002 ->
                    throw new BusinessException("INVALID_TICKET_STATUS", message);
            case 4003 ->
                    throw new BusinessException("CANCELLATION_DEADLINE_PASSED", message);
            case 5003 ->
                    throw new BusinessException("CHANGE_DEADLINE_PASSED", message);
            case 5005 ->
                    throw new BusinessException("DIFFERENT_ROUTE", message);
            default ->
                    throw new BusinessException("SP_ERROR_" + errorCode, message);
        }
    }

    // ─── Mapping helpers ────────────────────────────────────────────────────────

    private TicketResponse toTicketResponse(Ve ve) {
        ChuyenBay cb = ve.getChuyenBay();
        HangVe hv = ve.getHangVe();
        KhachHang kh = ve.getKhachHang();

        TicketResponse.FlightInfo flightInfo = TicketResponse.FlightInfo.builder()
                .maChuyenBay(cb.getMaChuyenBay())
                .maChuyenBayCode(cb.getMaChuyenBayCode())
                .sanBayDi(cb.getSanBayDi() != null ? cb.getSanBayDi().getMaSanBay() : null)
                .tenSanBayDi(cb.getSanBayDi() != null ? cb.getSanBayDi().getTenSanBay() : null)
                .sanBayDen(cb.getSanBayDen() != null ? cb.getSanBayDen().getMaSanBay() : null)
                .tenSanBayDen(cb.getSanBayDen() != null ? cb.getSanBayDen().getTenSanBay() : null)
                .ngayGioBay(cb.getNgayGioBay())
                .build();

        TicketResponse.ClassInfo classInfo = TicketResponse.ClassInfo.builder()
                .maHangVe(hv != null ? hv.getMaHangVe() : ve.getMaHangVe())
                .tenHangVe(hv != null ? hv.getTenHangVe() : null)
                .donGia(ve.getGiaVe())
                .build();

        TicketResponse.CustomerInfo customerInfo = TicketResponse.CustomerInfo.builder()
                .maKhachHang(kh != null ? kh.getMaKhachHang() : ve.getMaKhachHang())
                .hoTen(kh != null ? kh.getHoTen() : null)
                .email(kh != null ? kh.getEmail() : null)
                .soDienThoai(kh != null ? kh.getSoDienThoai() : null)
                .cccd(kh != null ? kh.getCccd() : null)
                .build();

        return TicketResponse.builder()
                .maVe(ve.getMaVe())
                .maVeCode(ve.getMaVeCode())
                .chuyenBay(flightInfo)
                .hangVe(classInfo)
                .khachHang(customerInfo)
                .giaVe(ve.getGiaVe())
                .trangThaiVe(ve.getTrangThaiVe())
                .maPhieuDatCho(ve.getMaPhieuDatCho())
                .createdAt(ve.getCreatedAt())
                .build();
    }

    private BookingResponse toBookingResponse(PhieuDatCho phieu, Ve ve) {
        TicketResponse veResponse = ve != null ? toTicketResponse(ve) : null;
        return BookingResponse.builder()
                .maPhieuDatCho(phieu.getMaPhieuDatCho())
                .ve(veResponse)
                .tongTien(phieu.getTongTien())
                .trangThaiDatCho(phieu.getTrangThaiDatCho())
                .hanThanhToan(phieu.getHanThanhToan())
                .createdAt(phieu.getCreatedAt())
                .build();
    }

    private Integer resolveCurrentKhachHang() {
        Integer maTaiKhoan = SecurityUtils.getCurrentUserId();
        return taiKhoanRepository.findById(maTaiKhoan)
                .map(tk -> {
                    if (tk.getMaKhachHang() == null) {
                        throw new BusinessException("NO_CUSTOMER_PROFILE",
                                "Tài khoản chưa được liên kết với hồ sơ khách hàng");
                    }
                    return tk.getMaKhachHang();
                })
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "id", maTaiKhoan));
    }

    // ─── Inner record ───────────────────────────────────────────────────────────

    private record SpResult(int errorCode, String message, Map<String, Object> data) {

        boolean isSuccess() {
            return errorCode == 0;
        }

        static SpResult failure(int code, String msg) {
            return new SpResult(code, msg, null);
        }

        static SpResult success(Map<String, Object> data, String msg) {
            return new SpResult(0, msg, data);
        }
    }
}
