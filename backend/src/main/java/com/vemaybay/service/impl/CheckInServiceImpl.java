package com.vemaybay.service.impl;

import com.vemaybay.dto.checkin.BoardingPassResponse;
import com.vemaybay.dto.checkin.CheckInRequest;
import com.vemaybay.entity.*;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ForbiddenException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.CheckInRepository;
import com.vemaybay.repository.TaiKhoanRepository;
import com.vemaybay.repository.VeRepository;
import com.vemaybay.security.SecurityUtils;
import com.vemaybay.service.CheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CheckInServiceImpl implements CheckInService {

    private final CheckInRepository checkInRepository;
    private final VeRepository veRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public BoardingPassResponse checkIn(CheckInRequest request) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(request.getMaVe())
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", request.getMaVe()));

        ensureCustomerOwnsTicket(ve, "check-in");

        String soGhe = resolveSeat(request.getSoGhe());
        SpResult result = callSpCheckIn(request.getMaVe(), soGhe);
        if (!result.isSuccess()) {
            throwFromSpError(result.errorCode(), result.message());
        }

        Integer maCheckIn = (Integer) result.data().get("MaCheckIn");
        CheckIn checkIn = checkInRepository.findById(maCheckIn)
                .orElseThrow(() -> new ResourceNotFoundException("Check-in", "id", maCheckIn));

        return toBoardingPass(checkIn, ve);
    }

    @Override
    public BoardingPassResponse getBoardingPass(Integer maVe) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(maVe)
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", maVe));
        ensureCustomerOwnsTicket(ve, "xem thẻ lên máy bay của");

        CheckIn checkIn = checkInRepository.findByMaVe(maVe)
                .orElseThrow(() -> new BusinessException("NOT_CHECKED_IN",
                        "Vé chưa được check-in"));

        return toBoardingPass(checkIn, ve);
    }

    @Override
    public BoardingPassResponse getBoardingPassByTicketCode(String maVeCode) {
        Ve ve = findTicketByCode(maVeCode);
        ensureCustomerOwnsTicket(ve, "xem trạng thái check-in của");

        CheckIn checkIn = checkInRepository.findByMaVe(ve.getMaVe())
                .orElseThrow(() -> new BusinessException("NOT_CHECKED_IN",
                        "Vé chưa được check-in"));

        return toBoardingPass(checkIn, ve);
    }

    // ─── SP caller ──────────────────────────────────────────────────────────────

    private SpResult callSpCheckIn(int maVe, String soGhe) {
        return jdbcTemplate.execute((ConnectionCallback<SpResult>) conn -> {
            try (CallableStatement cs = conn.prepareCall(
                    "{call dbo.sp_CheckIn_Online(?, ?, ?, ?)}")) {
                cs.setInt(1, maVe);
                cs.setString(2, soGhe);
                cs.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
                cs.registerOutParameter(4, Types.INTEGER);
                cs.execute();
                try (ResultSet rs = cs.getResultSet()) {
                    return readSpResult(rs, "MaCheckIn", "BoardingPassCode", "SoGhe", "NgayGioBay");
                }
            }
        });
    }

    private String resolveSeat(String soGhe) {
        if (soGhe != null && !soGhe.isBlank()) {
            return soGhe.trim().toUpperCase();
        }

        int row = ThreadLocalRandom.current().nextInt(1, 31);
        char column = (char) ('A' + ThreadLocalRandom.current().nextInt(6));
        return row + String.valueOf(column);
    }

    private Ve findTicketByCode(String maVeCode) {
        if (maVeCode == null || maVeCode.isBlank()) {
            throw new BusinessException("INVALID_TICKET_CODE", "Mã vé không được để trống");
        }
        return veRepository.findByMaVeCodeIgnoreCaseAndIsDeletedFalse(maVeCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "mã vé", maVeCode));
    }

    private void ensureCustomerOwnsTicket(Ve ve, String action) {
        if (!SecurityUtils.isUser()) {
            return;
        }
        Integer maTaiKhoan = SecurityUtils.getCurrentUserId();
        Integer maKhachHang = taiKhoanRepository.findById(maTaiKhoan)
                .map(tk -> tk.getMaKhachHang())
                .orElse(null);
        if (maKhachHang == null || !maKhachHang.equals(ve.getMaKhachHang())) {
            throw new ForbiddenException("Bạn không có quyền " + action + " vé này");
        }
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
            case 6001 -> throw new ResourceNotFoundException(message);
            case 6002 -> throw new BusinessException("INVALID_TICKET_STATUS", message);
            case 6003 -> throw new BusinessException("ALREADY_CHECKED_IN", message);
            case 6004 -> throw new BusinessException("CHECKIN_NOT_OPEN_YET", message);
            case 6005 -> throw new BusinessException("CHECKIN_CLOSED", message);
            default -> throw new BusinessException("SP_ERROR_" + errorCode, message);
        }
    }

    // ─── Mapping helpers ────────────────────────────────────────────────────────

    private BoardingPassResponse toBoardingPass(CheckIn checkIn, Ve ve) {
        ChuyenBay cb = ve.getChuyenBay();
        HangVe hv = ve.getHangVe();
        KhachHang kh = ve.getKhachHang();

        BoardingPassResponse.TicketInfo ticketInfo = BoardingPassResponse.TicketInfo.builder()
                .maVe(ve.getMaVe())
                .maVeCode(ve.getMaVeCode())
                .trangThaiVe(ve.getTrangThaiVe())
                .hangVe(hv != null ? hv.getTenHangVe() : null)
                .build();

        BoardingPassResponse.PassengerInfo passengerInfo = BoardingPassResponse.PassengerInfo.builder()
                .hoTen(kh != null ? kh.getHoTen() : null)
                .cccd(kh != null ? kh.getCccd() : null)
                .email(kh != null ? kh.getEmail() : null)
                .build();

        BoardingPassResponse.FlightInfo flightInfo = null;
        if (cb != null) {
            flightInfo = BoardingPassResponse.FlightInfo.builder()
                    .maChuyenBayCode(cb.getMaChuyenBayCode())
                    .sanBayDi(cb.getSanBayDi() != null ? cb.getSanBayDi().getMaSanBay() : null)
                    .tenSanBayDi(cb.getSanBayDi() != null ? cb.getSanBayDi().getTenSanBay() : null)
                    .sanBayDen(cb.getSanBayDen() != null ? cb.getSanBayDen().getMaSanBay() : null)
                    .tenSanBayDen(cb.getSanBayDen() != null ? cb.getSanBayDen().getTenSanBay() : null)
                    .ngayGioBay(cb.getNgayGioBay())
                    .build();
        }

        return BoardingPassResponse.builder()
                .maCheckIn(checkIn.getMaCheckIn())
                .boardingPassCode(checkIn.getBoardingPassCode())
                .soGhe(checkIn.getSoGhe())
                .trangThai(checkIn.getTrangThai())
                .checkInAt(checkIn.getCheckInAt())
                .ve(ticketInfo)
                .hanhKhach(passengerInfo)
                .chuyenBay(flightInfo)
                .build();
    }

    private record SpResult(int errorCode, String message, Map<String, Object> data) {
        boolean isSuccess() { return errorCode == 0; }
        static SpResult failure(int code, String msg) { return new SpResult(code, msg, null); }
        static SpResult success(Map<String, Object> data, String msg) { return new SpResult(0, msg, data); }
    }
}
