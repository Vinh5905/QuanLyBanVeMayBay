package com.vemaybay.service.impl;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.PaginationInfo;
import com.vemaybay.dto.flight.*;
import com.vemaybay.entity.*;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.*;
import com.vemaybay.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final ChuyenBayRepository chuyenBayRepository;
    private final SanBayRepository sanBayRepository;
    private final ChiTietHangVeRepository chiTietHangVeRepository;
    private final TrungGianRepository trungGianRepository;
    private final HangVeRepository hangVeRepository;

    @Override
    @Transactional
    public FlightResponse createFlight(CreateFlightRequest request) {
        if (request.getSanBayDi().equals(request.getSanBayDen())) {
            throw new BusinessException("SAME_AIRPORT", "Sân bay đi và sân bay đến không được trùng nhau");
        }
        if (chuyenBayRepository.existsByMaChuyenBayCode(request.getMaChuyenBayCode())) {
            throw new ConflictException("DUPLICATE_FLIGHT_CODE", "Mã chuyến bay đã tồn tại: " + request.getMaChuyenBayCode());
        }

        SanBay sanBayDi = sanBayRepository.findById(request.getSanBayDi())
                .orElseThrow(() -> new ResourceNotFoundException("Sân bay đi", "mã", request.getSanBayDi()));
        SanBay sanBayDen = sanBayRepository.findById(request.getSanBayDen())
                .orElseThrow(() -> new ResourceNotFoundException("Sân bay đến", "mã", request.getSanBayDen()));

        if (request.getDanhSachTrungGian() != null && request.getDanhSachTrungGian().size() > 2) {
            throw new BusinessException("TOO_MANY_STOPOVERS", "Tối đa 2 sân bay trung gian");
        }

        ChuyenBay chuyenBay = ChuyenBay.builder()
                .maChuyenBayCode(request.getMaChuyenBayCode())
                .sanBayDi(sanBayDi)
                .sanBayDen(sanBayDen)
                .ngayGioBay(request.getNgayGioBay())
                .thoiGianBay(request.getThoiGianBay())
                .giaCoBan(request.getGiaCoBan())
                .trangThaiChuyenBay("SCHEDULED")
                .isDeleted(false)
                .build();

        chuyenBay = chuyenBayRepository.save(chuyenBay);

        final Integer maChuyenBay = chuyenBay.getMaChuyenBay();
        saveSeatClasses(maChuyenBay, request.getDanhSachHangVe());
        saveStopovers(chuyenBay, request.getDanhSachTrungGian());

        return toResponse(chuyenBayRepository.findById(maChuyenBay).orElseThrow());
    }

    @Override
    public FlightResponse getFlightById(Integer id) {
        ChuyenBay cb = chuyenBayRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Chuyến bay", "id", id));
        return toResponse(cb);
    }

    @Override
    public ApiResponse<List<FlightResponse>> getFlights(FlightSearchRequest request) {
        String[] sortParts = request.getSort().split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, sortParts[0]);

        PageRequest pageRequest = PageRequest.of(request.getPage(), request.getSize(), sort);

        LocalDateTime ngayBayFrom = null;
        LocalDateTime ngayBayTo = null;
        if (request.getNgayBay() != null) {
            ngayBayFrom = request.getNgayBay().atStartOfDay();
            ngayBayTo = request.getNgayBay().plusDays(1).atStartOfDay();
        }

        Page<ChuyenBay> page = chuyenBayRepository.findWithFilters(
                request.getSanBayDi(),
                request.getSanBayDen(),
                request.getTrangThai(),
                ngayBayFrom,
                ngayBayTo,
                pageRequest
        );

        List<FlightResponse> data = page.getContent().stream().map(this::toResponse).toList();

        PaginationInfo pagination = PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.successWithPagination(data, pagination);
    }

    @Override
    @Transactional
    public FlightResponse updateFlight(Integer id, UpdateFlightRequest request) {
        ChuyenBay cb = chuyenBayRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Chuyến bay", "id", id));

        if ("CANCELLED".equals(cb.getTrangThaiChuyenBay())) {
            throw new BusinessException("FLIGHT_CANCELLED", "Không thể cập nhật chuyến bay đã hủy");
        }

        if (request.getNgayGioBay() != null) cb.setNgayGioBay(request.getNgayGioBay());
        if (request.getThoiGianBay() != null) cb.setThoiGianBay(request.getThoiGianBay());
        if (request.getGiaCoBan() != null) cb.setGiaCoBan(request.getGiaCoBan());

        if (request.getDanhSachTrungGian() != null && request.getDanhSachTrungGian().size() > 2) {
            throw new BusinessException("TOO_MANY_STOPOVERS", "Tối đa 2 sân bay trung gian");
        }

        if (request.getDanhSachHangVe() != null) {
            chiTietHangVeRepository.deleteAll(chiTietHangVeRepository.findByMaChuyenBay(id));
            saveSeatClasses(id, request.getDanhSachHangVe());
        }

        chuyenBayRepository.save(cb);
        return toResponse(chuyenBayRepository.findById(id).orElseThrow());
    }

    @Override
    @Transactional
    public void cancelFlight(Integer id) {
        ChuyenBay cb = chuyenBayRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Chuyến bay", "id", id));

        if ("CANCELLED".equals(cb.getTrangThaiChuyenBay())) {
            throw new BusinessException("ALREADY_CANCELLED", "Chuyến bay đã bị hủy trước đó");
        }

        cb.setTrangThaiChuyenBay("CANCELLED");
        cb.setIsDeleted(true);
        chuyenBayRepository.save(cb);
    }

    @Override
    public List<FlightResponse> searchFlights(FlightSearchRequest request) {
        LocalDateTime ngayBayFrom = null;
        LocalDateTime ngayBayTo = null;
        if (request.getNgayBay() != null) {
            ngayBayFrom = request.getNgayBay().atStartOfDay();
            ngayBayTo = request.getNgayBay().plusDays(1).atStartOfDay();
        }

        Page<ChuyenBay> page = chuyenBayRepository.findWithFilters(
                request.getSanBayDi(),
                request.getSanBayDen(),
                "SCHEDULED",
                ngayBayFrom,
                ngayBayTo,
                PageRequest.of(0, 100, Sort.by("ngayGioBay").ascending())
        );

        return page.getContent().stream().map(this::toResponse).toList();
    }

    @Override
    public List<SanBayResponse> getAllAirports() {
        return sanBayRepository.findByIsActiveTrue().stream()
                .map(sb -> SanBayResponse.builder()
                        .maSanBay(sb.getMaSanBay())
                        .tenSanBay(sb.getTenSanBay())
                        .thanhPho(sb.getThanhPho())
                        .quocGia(sb.getQuocGia())
                        .build())
                .toList();
    }

    @Override
    public List<HangVeResponse> getActiveTicketClasses() {
        return hangVeRepository.findByIsActiveTrueOrderByHeSoGiaAscMaHangVeAsc().stream()
                .map(hv -> HangVeResponse.builder()
                        .maHangVe(hv.getMaHangVe())
                        .tenHangVe(hv.getTenHangVe())
                        .heSoGia(hv.getHeSoGia())
                        .moTa(hv.getMoTa())
                        .build())
                .toList();
    }

    private void saveSeatClasses(Integer maChuyenBay, List<CreateFlightRequest.HangVeInput> inputs) {
        for (CreateFlightRequest.HangVeInput hv : inputs) {
            ChiTietHangVe ct = ChiTietHangVe.builder()
                    .maChuyenBay(maChuyenBay)
                    .maHangVe(hv.getMaHangVe())
                    .soLuong(hv.getSoLuong())
                    .soGheDaDat(0)
                    .donGia(hv.getDonGia())
                    .build();
            chiTietHangVeRepository.save(ct);
        }
    }

    private void saveStopovers(ChuyenBay chuyenBay, List<CreateFlightRequest.TrungGianInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            return;
        }

        int fallbackOrder = 1;
        for (CreateFlightRequest.TrungGianInput input : inputs) {
            SanBay sanBayTrungGian = sanBayRepository.findById(input.getMaSanBay())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Sân bay trung gian", "mã", input.getMaSanBay()));

            TrungGian trungGian = TrungGian.builder()
                    .chuyenBay(chuyenBay)
                    .sanBay(sanBayTrungGian)
                    .thuTu(input.getThuTu() != null ? input.getThuTu() : fallbackOrder)
                    .thoiGianDung(input.getThoiGianDung())
                    .ghiChu(input.getGhiChu())
                    .build();
            trungGianRepository.save(trungGian);
            fallbackOrder++;
        }
    }

    private FlightResponse toResponse(ChuyenBay cb) {
        List<ChiTietHangVe> chiTiet = chiTietHangVeRepository.findByMaChuyenBay(cb.getMaChuyenBay());

        List<FlightResponse.HangVeInfo> hangVeInfos = chiTiet.stream()
                .map(ct -> FlightResponse.HangVeInfo.builder()
                        .maHangVe(ct.getMaHangVe())
                        .tenHangVe(ct.getHangVe() != null ? ct.getHangVe().getTenHangVe() : null)
                        .soLuong(ct.getSoLuong())
                        .soGheDaDat(ct.getSoGheDaDat())
                        .soGheCon(ct.getSoLuong() - ct.getSoGheDaDat())
                        .donGia(ct.getDonGia())
                        .build())
                .toList();

        List<FlightResponse.TrungGianInfo> trungGianInfos = trungGianRepository
                .findByChuyenBay_MaChuyenBayOrderByThuTuAsc(cb.getMaChuyenBay())
                .stream()
                .map(tg -> FlightResponse.TrungGianInfo.builder()
                        .maSanBay(tg.getSanBay().getMaSanBay())
                        .tenSanBay(tg.getSanBay().getTenSanBay())
                        .thanhPho(tg.getSanBay().getThanhPho())
                        .thuTu(tg.getThuTu())
                        .thoiGianDung(tg.getThoiGianDung())
                        .ghiChu(tg.getGhiChu())
                        .build())
                .toList();

        return FlightResponse.builder()
                .maChuyenBay(cb.getMaChuyenBay())
                .maChuyenBayCode(cb.getMaChuyenBayCode())
                .sanBayDi(FlightResponse.SanBayInfo.builder()
                        .maSanBay(cb.getSanBayDi().getMaSanBay())
                        .tenSanBay(cb.getSanBayDi().getTenSanBay())
                        .thanhPho(cb.getSanBayDi().getThanhPho())
                        .build())
                .sanBayDen(FlightResponse.SanBayInfo.builder()
                        .maSanBay(cb.getSanBayDen().getMaSanBay())
                        .tenSanBay(cb.getSanBayDen().getTenSanBay())
                        .thanhPho(cb.getSanBayDen().getThanhPho())
                        .build())
                .ngayGioBay(cb.getNgayGioBay())
                .thoiGianBay(cb.getThoiGianBay())
                .giaCoBan(cb.getGiaCoBan())
                .trangThaiChuyenBay(cb.getTrangThaiChuyenBay())
                .danhSachHangVe(hangVeInfos)
                .danhSachTrungGian(trungGianInfos)
                .createdAt(cb.getCreatedAt())
                .build();
    }
}
