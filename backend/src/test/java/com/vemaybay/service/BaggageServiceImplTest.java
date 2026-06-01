package com.vemaybay.service;

import com.vemaybay.dto.baggage.BaggagePricingResponse;
import com.vemaybay.dto.baggage.BaggageResponse;
import com.vemaybay.dto.baggage.RegisterBaggageRequest;
import com.vemaybay.entity.*;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.*;
import com.vemaybay.service.impl.BaggageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BaggageServiceImpl Unit Tests")
class BaggageServiceImplTest {

    @Mock BangGiaHanhLyRepository bangGiaHanhLyRepository;
    @Mock GoiHanhLyRepository goiHanhLyRepository;
    @Mock KienHanhLyRepository kienHanhLyRepository;
    @Mock VeRepository veRepository;

    @InjectMocks BaggageServiceImpl baggageService;

    private Ve hopLeVe;
    private ChuyenBay chuyenBayFuture;
    private BangGiaHanhLy bangGia20kg;

    @BeforeEach
    void setUp() {
        chuyenBayFuture = ChuyenBay.builder()
                .maChuyenBay(1)
                .maChuyenBayCode("VN123")
                .ngayGioBay(LocalDateTime.now().plusDays(5))
                .trangThaiChuyenBay("SCHEDULED")
                .isDeleted(false)
                .build();

        hopLeVe = Ve.builder()
                .maVe(101)
                .maVeCode("VE001")
                .maChuyenBay(1)
                .chuyenBay(chuyenBayFuture)
                .maHangVe(1)
                .maKhachHang(5)
                .giaVe(BigDecimal.valueOf(1200000))
                .trangThaiVe("HOP_LE")
                .isDeleted(false)
                .build();

        bangGia20kg = BangGiaHanhLy.builder()
                .maBangGia(1)
                .tenGoi("Gói 20kg")
                .trongLuongToiDa(BigDecimal.valueOf(20))
                .giaMuaTruoc(BigDecimal.valueOf(250000))
                .giaTaiSanBay(BigDecimal.valueOf(350000))
                .isActive(true)
                .build();
    }

    // ─── getPricing ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getPricing()")
    class GetPricingTests {

        @Test
        @DisplayName("Lấy bảng giá hành lý thành công")
        void getPricing_success() {
            BangGiaHanhLy bangGia30kg = BangGiaHanhLy.builder()
                    .maBangGia(2)
                    .tenGoi("Gói 30kg")
                    .trongLuongToiDa(BigDecimal.valueOf(30))
                    .giaMuaTruoc(BigDecimal.valueOf(350000))
                    .giaTaiSanBay(BigDecimal.valueOf(480000))
                    .isActive(true)
                    .build();

            when(bangGiaHanhLyRepository.findByIsActiveTrue()).thenReturn(List.of(bangGia20kg, bangGia30kg));

            List<BaggagePricingResponse> result = baggageService.getPricing();

            assertThat(result).hasSize(2);
            assertThat(result).extracting("tenGoi").containsExactlyInAnyOrder("Gói 20kg", "Gói 30kg");
        }

        @Test
        @DisplayName("Lấy bảng giá trả danh sách rỗng khi không có gói active")
        void getPricing_noActivePricing_returnsEmptyList() {
            when(bangGiaHanhLyRepository.findByIsActiveTrue()).thenReturn(Collections.emptyList());

            List<BaggagePricingResponse> result = baggageService.getPricing();

            assertThat(result).isEmpty();
        }
    }

    // ─── registerBaggage ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("registerBaggage()")
    class RegisterBaggageTests {

        @Test
        @DisplayName("Đăng ký hành lý thành công - giá ưu đãi (mua trước 3 giờ)")
        void registerBaggage_earlyBooking_usesDiscountPrice() {
            // Flight is 5 days away → well before 3-hour cutoff
            when(veRepository.findByMaVeAndIsDeletedFalse(101)).thenReturn(Optional.of(hopLeVe));
            when(bangGiaHanhLyRepository.findById(1)).thenReturn(Optional.of(bangGia20kg));
            when(kienHanhLyRepository.countByMaVe(101)).thenReturn(0);

            GoiHanhLy savedGoi = GoiHanhLy.builder()
                    .maGoiHanhLy(33)
                    .maVe(101)
                    .maBangGia(1)
                    .bangGia(bangGia20kg)
                    .tongTrongLuong(BigDecimal.valueOf(18.5))
                    .tongPhi(BigDecimal.valueOf(250000))
                    .trangThai("REGISTERED")
                    .build();

            when(goiHanhLyRepository.save(any())).thenReturn(savedGoi);
            when(goiHanhLyRepository.findById(33)).thenReturn(Optional.of(savedGoi));
            when(kienHanhLyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(kienHanhLyRepository.findByMaGoiHanhLy(33)).thenReturn(Collections.emptyList());

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(101);
            request.setMaBangGia(1);
            RegisterBaggageRequest.KienInput kien = new RegisterBaggageRequest.KienInput();
            kien.setTrongLuong(BigDecimal.valueOf(18.5));
            kien.setGhiChu("Vali xanh");
            request.setDanhSachKien(List.of(kien));

            BaggageResponse result = baggageService.registerBaggage(request);

            assertThat(result.getMaGoiHanhLy()).isEqualTo(33);
            // Verify giá ưu đãi được dùng
            verify(goiHanhLyRepository).save(argThat(g -> g.getTongPhi().equals(BigDecimal.valueOf(250000))));
        }

        @Test
        @DisplayName("Đăng ký hành lý thành công - giá tại quầy (mua muộn hơn 3 giờ)")
        void registerBaggage_lateBooking_usesAirportPrice() {
            // Flight is in 2 hours → past the 3-hour cutoff
            ChuyenBay nearFlight = ChuyenBay.builder()
                    .maChuyenBay(2)
                    .ngayGioBay(LocalDateTime.now().plusHours(2))
                    .build();
            Ve nearVe = Ve.builder()
                    .maVe(102).maVeCode("VE002")
                    .maChuyenBay(2).chuyenBay(nearFlight)
                    .maHangVe(1).maKhachHang(5)
                    .giaVe(BigDecimal.valueOf(1200000))
                    .trangThaiVe("HOP_LE").isDeleted(false).build();

            when(veRepository.findByMaVeAndIsDeletedFalse(102)).thenReturn(Optional.of(nearVe));
            when(bangGiaHanhLyRepository.findById(1)).thenReturn(Optional.of(bangGia20kg));
            when(kienHanhLyRepository.countByMaVe(102)).thenReturn(0);

            GoiHanhLy savedGoi = GoiHanhLy.builder()
                    .maGoiHanhLy(34).maVe(102).maBangGia(1).bangGia(bangGia20kg)
                    .tongTrongLuong(BigDecimal.valueOf(15))
                    .tongPhi(BigDecimal.valueOf(350000)) // giá tại quầy
                    .trangThai("REGISTERED").build();

            when(goiHanhLyRepository.save(any())).thenReturn(savedGoi);
            when(goiHanhLyRepository.findById(34)).thenReturn(Optional.of(savedGoi));
            when(kienHanhLyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(kienHanhLyRepository.findByMaGoiHanhLy(34)).thenReturn(Collections.emptyList());

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(102);
            request.setMaBangGia(1);
            RegisterBaggageRequest.KienInput kien = new RegisterBaggageRequest.KienInput();
            kien.setTrongLuong(BigDecimal.valueOf(15));
            request.setDanhSachKien(List.of(kien));

            BaggageResponse result = baggageService.registerBaggage(request);

            assertThat(result).isNotNull();
            // Late booking → airport price
            verify(goiHanhLyRepository).save(argThat(g -> g.getTongPhi().equals(BigDecimal.valueOf(350000))));
        }

        @Test
        @DisplayName("Đăng ký thất bại: vé không ở trạng thái HOP_LE")
        void registerBaggage_ticketNotHopLe_throwsBusinessException() {
            Ve dangGiuChoVe = Ve.builder()
                    .maVe(103).maVeCode("VE003")
                    .maChuyenBay(1).chuyenBay(chuyenBayFuture)
                    .maHangVe(1).maKhachHang(5)
                    .giaVe(BigDecimal.valueOf(1200000))
                    .trangThaiVe("DANG_GIU_CHO").isDeleted(false).build();

            when(veRepository.findByMaVeAndIsDeletedFalse(103)).thenReturn(Optional.of(dangGiuChoVe));

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(103);
            request.setMaBangGia(1);
            request.setDanhSachKien(List.of());

            assertThatThrownBy(() -> baggageService.registerBaggage(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("HOP_LE");
        }

        @Test
        @DisplayName("Đăng ký thất bại: trọng lượng kiện vượt giới hạn bảng giá")
        void registerBaggage_weightExceeded_throwsBusinessException() {
            when(veRepository.findByMaVeAndIsDeletedFalse(101)).thenReturn(Optional.of(hopLeVe));
            when(bangGiaHanhLyRepository.findById(1)).thenReturn(Optional.of(bangGia20kg));

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(101);
            request.setMaBangGia(1);
            RegisterBaggageRequest.KienInput heavyKien = new RegisterBaggageRequest.KienInput();
            heavyKien.setTrongLuong(BigDecimal.valueOf(25)); // 25 > 20kg limit
            request.setDanhSachKien(List.of(heavyKien));

            assertThatThrownBy(() -> baggageService.registerBaggage(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("vượt quá giới hạn");
        }

        @Test
        @DisplayName("Đăng ký thất bại: vượt giới hạn 15 kiện")
        void registerBaggage_tooManyPieces_throwsConflict() {
            when(veRepository.findByMaVeAndIsDeletedFalse(101)).thenReturn(Optional.of(hopLeVe));
            when(bangGiaHanhLyRepository.findById(1)).thenReturn(Optional.of(bangGia20kg));
            when(kienHanhLyRepository.countByMaVe(101)).thenReturn(14); // already 14 pieces

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(101);
            request.setMaBangGia(1);
            // Adding 2 pieces would make 14+2=16 > 15
            RegisterBaggageRequest.KienInput k1 = new RegisterBaggageRequest.KienInput();
            k1.setTrongLuong(BigDecimal.valueOf(10));
            RegisterBaggageRequest.KienInput k2 = new RegisterBaggageRequest.KienInput();
            k2.setTrongLuong(BigDecimal.valueOf(10));
            request.setDanhSachKien(List.of(k1, k2));

            assertThatThrownBy(() -> baggageService.registerBaggage(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("15 kiện");
        }

        @Test
        @DisplayName("Đăng ký thất bại: không tìm thấy vé")
        void registerBaggage_ticketNotFound_throwsResourceNotFound() {
            when(veRepository.findByMaVeAndIsDeletedFalse(999)).thenReturn(Optional.empty());

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(999);
            request.setMaBangGia(1);
            request.setDanhSachKien(Collections.emptyList());

            assertThatThrownBy(() -> baggageService.registerBaggage(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Đăng ký thất bại: bảng giá không active")
        void registerBaggage_inactivePricing_throwsBusinessException() {
            BangGiaHanhLy inactiveBangGia = BangGiaHanhLy.builder()
                    .maBangGia(5).tenGoi("Gói cũ")
                    .trongLuongToiDa(BigDecimal.valueOf(20))
                    .giaMuaTruoc(BigDecimal.valueOf(200000))
                    .giaTaiSanBay(BigDecimal.valueOf(300000))
                    .isActive(false).build();

            when(veRepository.findByMaVeAndIsDeletedFalse(101)).thenReturn(Optional.of(hopLeVe));
            when(bangGiaHanhLyRepository.findById(5)).thenReturn(Optional.of(inactiveBangGia));

            RegisterBaggageRequest request = new RegisterBaggageRequest();
            request.setMaVe(101);
            request.setMaBangGia(5);
            request.setDanhSachKien(Collections.emptyList());

            assertThatThrownBy(() -> baggageService.registerBaggage(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("không còn hoạt động");
        }
    }

    // ─── cancelBaggage ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("cancelBaggage()")
    class CancelBaggageTests {

        @Test
        @DisplayName("Hủy gói hành lý thành công")
        void cancelBaggage_success() {
            GoiHanhLy goi = GoiHanhLy.builder()
                    .maGoiHanhLy(33).maVe(101).maBangGia(1)
                    .trangThai("REGISTERED").build();

            when(goiHanhLyRepository.findById(33)).thenReturn(Optional.of(goi));
            when(goiHanhLyRepository.save(any())).thenReturn(goi);

            assertThatCode(() -> baggageService.cancelBaggage(33)).doesNotThrowAnyException();
            verify(goiHanhLyRepository).save(argThat(g -> "CANCELLED".equals(g.getTrangThai())));
        }

        @Test
        @DisplayName("Hủy thất bại: gói đã bị hủy trước đó")
        void cancelBaggage_alreadyCancelled_throwsBusinessException() {
            GoiHanhLy cancelledGoi = GoiHanhLy.builder()
                    .maGoiHanhLy(33).maVe(101).maBangGia(1)
                    .trangThai("CANCELLED").build();

            when(goiHanhLyRepository.findById(33)).thenReturn(Optional.of(cancelledGoi));

            assertThatThrownBy(() -> baggageService.cancelBaggage(33))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã bị hủy");
        }

        @Test
        @DisplayName("Hủy thất bại: gói không tồn tại")
        void cancelBaggage_notFound_throwsResourceNotFound() {
            when(goiHanhLyRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> baggageService.cancelBaggage(999))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── getBaggageByTicket ───────────────────────────────────────────────────

    @Test
    @DisplayName("Lấy danh sách hành lý theo mã vé thành công")
    void getBaggageByTicket_success() {
        GoiHanhLy goi = GoiHanhLy.builder()
                .maGoiHanhLy(33).maVe(101).maBangGia(1).bangGia(bangGia20kg)
                .tongTrongLuong(BigDecimal.valueOf(18.5))
                .tongPhi(BigDecimal.valueOf(250000))
                .trangThai("REGISTERED").build();

        when(goiHanhLyRepository.findByMaVeAndTrangThaiNot(101, "CANCELLED"))
                .thenReturn(List.of(goi));
        when(kienHanhLyRepository.findByMaGoiHanhLy(33)).thenReturn(Collections.emptyList());

        List<BaggageResponse> result = baggageService.getBaggageByTicket(101);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMaGoiHanhLy()).isEqualTo(33);
    }
}
