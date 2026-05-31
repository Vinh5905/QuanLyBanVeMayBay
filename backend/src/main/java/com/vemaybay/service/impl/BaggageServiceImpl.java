package com.vemaybay.service.impl;

import com.vemaybay.dto.baggage.BaggagePricingResponse;
import com.vemaybay.dto.baggage.BaggageResponse;
import com.vemaybay.dto.baggage.RegisterBaggageRequest;
import com.vemaybay.entity.*;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.*;
import com.vemaybay.service.BaggageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BaggageServiceImpl implements BaggageService {

    private static final int MAX_PIECES_PER_TICKET = 15;
    private static final int EARLY_BOOKING_HOURS = 3;

    private final BangGiaHanhLyRepository bangGiaHanhLyRepository;
    private final GoiHanhLyRepository goiHanhLyRepository;
    private final KienHanhLyRepository kienHanhLyRepository;
    private final VeRepository veRepository;

    @Override
    public List<BaggagePricingResponse> getPricing() {
        return bangGiaHanhLyRepository.findByIsActiveTrue().stream()
                .map(bg -> BaggagePricingResponse.builder()
                        .maBangGia(bg.getMaBangGia())
                        .tenGoi(bg.getTenGoi())
                        .trongLuongToiDa(bg.getTrongLuongToiDa())
                        .giaMuaTruoc(bg.getGiaMuaTruoc())
                        .giaTaiSanBay(bg.getGiaTaiSanBay())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public BaggageResponse registerBaggage(RegisterBaggageRequest request) {
        Ve ve = veRepository.findByMaVeAndIsDeletedFalse(request.getMaVe())
                .orElseThrow(() -> new ResourceNotFoundException("Vé", "id", request.getMaVe()));

        if (!"HOP_LE".equals(ve.getTrangThaiVe())) {
            throw new BusinessException("INVALID_TICKET_STATUS",
                    "Chỉ có thể đăng ký hành lý cho vé HOP_LE. Trạng thái hiện tại: " + ve.getTrangThaiVe());
        }

        BangGiaHanhLy bangGia = bangGiaHanhLyRepository.findById(request.getMaBangGia())
                .orElseThrow(() -> new ResourceNotFoundException("Bảng giá hành lý", "id", request.getMaBangGia()));

        if (!Boolean.TRUE.equals(bangGia.getIsActive())) {
            throw new BusinessException("PRICING_INACTIVE", "Bảng giá hành lý này không còn hoạt động");
        }

        // Validate each piece weight
        for (RegisterBaggageRequest.KienInput kien : request.getDanhSachKien()) {
            if (kien.getTrongLuong().compareTo(bangGia.getTrongLuongToiDa()) > 0) {
                throw new BusinessException("WEIGHT_EXCEEDED",
                        String.format("Kiện hành lý %.1fkg vượt quá giới hạn %.1fkg của gói %s",
                                kien.getTrongLuong(), bangGia.getTrongLuongToiDa(), bangGia.getTenGoi()));
            }
        }

        // Check total pieces limit
        int existingPieces = kienHanhLyRepository.countByMaVe(request.getMaVe());
        int newPieces = request.getDanhSachKien().size();
        if (existingPieces + newPieces > MAX_PIECES_PER_TICKET) {
            throw new ConflictException("TOO_MANY_PIECES",
                    String.format("Vé đã có %d kiện, thêm %d kiện sẽ vượt quá giới hạn %d kiện",
                            existingPieces, newPieces, MAX_PIECES_PER_TICKET));
        }

        // Determine price based on flight time
        LocalDateTime ngayGioBay = ve.getChuyenBay().getNgayGioBay();
        boolean isEarly = LocalDateTime.now().plusHours(EARLY_BOOKING_HOURS).isBefore(ngayGioBay);
        BigDecimal pricePerPiece = isEarly ? bangGia.getGiaMuaTruoc() : bangGia.getGiaTaiSanBay();

        BigDecimal tongTrongLuong = request.getDanhSachKien().stream()
                .map(RegisterBaggageRequest.KienInput::getTrongLuong)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongPhi = pricePerPiece.multiply(BigDecimal.valueOf(newPieces));

        GoiHanhLy goi = GoiHanhLy.builder()
                .maVe(request.getMaVe())
                .maBangGia(request.getMaBangGia())
                .tongTrongLuong(tongTrongLuong)
                .tongPhi(tongPhi)
                .trangThai("REGISTERED")
                .build();

        goi = goiHanhLyRepository.save(goi);

        for (RegisterBaggageRequest.KienInput kien : request.getDanhSachKien()) {
            KienHanhLy kienHanhLy = KienHanhLy.builder()
                    .maGoiHanhLy(goi.getMaGoiHanhLy())
                    .maTheHanhLy(generateBaggageTag())
                    .trongLuong(kien.getTrongLuong())
                    .ghiChu(kien.getGhiChu())
                    .build();
            kienHanhLyRepository.save(kienHanhLy);
        }

        return toResponse(goiHanhLyRepository.findById(goi.getMaGoiHanhLy()).orElseThrow());
    }

    @Override
    public List<BaggageResponse> getBaggageByTicket(Integer maVe) {
        return goiHanhLyRepository.findByMaVeAndTrangThaiNot(maVe, "CANCELLED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void cancelBaggage(Integer id) {
        GoiHanhLy goi = goiHanhLyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gói hành lý", "id", id));

        if ("CANCELLED".equals(goi.getTrangThai())) {
            throw new BusinessException("ALREADY_CANCELLED", "Gói hành lý đã bị hủy trước đó");
        }

        goi.setTrangThai("CANCELLED");
        goiHanhLyRepository.save(goi);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private BaggageResponse toResponse(GoiHanhLy goi) {
        BangGiaHanhLy bg = goi.getBangGia();
        BaggageResponse.PricingInfo pricingInfo = bg != null
                ? BaggageResponse.PricingInfo.builder()
                        .maBangGia(bg.getMaBangGia())
                        .tenGoi(bg.getTenGoi())
                        .trongLuongToiDa(bg.getTrongLuongToiDa())
                        .giaMuaTruoc(bg.getGiaMuaTruoc())
                        .giaTaiSanBay(bg.getGiaTaiSanBay())
                        .build()
                : null;

        List<BaggageResponse.PieceInfo> pieces = kienHanhLyRepository
                .findByMaGoiHanhLy(goi.getMaGoiHanhLy())
                .stream()
                .map(k -> BaggageResponse.PieceInfo.builder()
                        .maKienHanhLy(k.getMaKienHanhLy())
                        .maTheHanhLy(k.getMaTheHanhLy())
                        .trongLuong(k.getTrongLuong())
                        .ghiChu(k.getGhiChu())
                        .build())
                .toList();

        return BaggageResponse.builder()
                .maGoiHanhLy(goi.getMaGoiHanhLy())
                .maVe(goi.getMaVe())
                .bangGia(pricingInfo)
                .tongTrongLuong(goi.getTongTrongLuong())
                .tongPhi(goi.getTongPhi())
                .trangThai(goi.getTrangThai())
                .danhSachKien(pieces)
                .createdAt(goi.getCreatedAt())
                .build();
    }

    private String generateBaggageTag() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rand = new Random().nextInt(10000);
        return "HL" + ts + String.format("%04d", rand);
    }
}
