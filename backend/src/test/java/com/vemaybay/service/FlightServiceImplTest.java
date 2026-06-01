package com.vemaybay.service;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.flight.CreateFlightRequest;
import com.vemaybay.dto.flight.FlightResponse;
import com.vemaybay.dto.flight.FlightSearchRequest;
import com.vemaybay.dto.flight.UpdateFlightRequest;
import com.vemaybay.entity.ChiTietHangVe;
import com.vemaybay.entity.ChuyenBay;
import com.vemaybay.entity.SanBay;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ConflictException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.ChiTietHangVeRepository;
import com.vemaybay.repository.ChuyenBayRepository;
import com.vemaybay.repository.SanBayRepository;
import com.vemaybay.service.impl.FlightServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FlightServiceImpl Unit Tests")
class FlightServiceImplTest {

    @Mock ChuyenBayRepository chuyenBayRepository;
    @Mock SanBayRepository sanBayRepository;
    @Mock ChiTietHangVeRepository chiTietHangVeRepository;

    @InjectMocks FlightServiceImpl flightService;

    private SanBay sanBaySGN;
    private SanBay sanBayHAN;
    private ChuyenBay scheduledFlight;

    @BeforeEach
    void setUp() {
        sanBaySGN = SanBay.builder()
                .maSanBay("SGN")
                .tenSanBay("Tân Sơn Nhất")
                .thanhPho("Hồ Chí Minh")
                .quocGia("Việt Nam")
                .isActive(true)
                .build();

        sanBayHAN = SanBay.builder()
                .maSanBay("HAN")
                .tenSanBay("Nội Bài")
                .thanhPho("Hà Nội")
                .quocGia("Việt Nam")
                .isActive(true)
                .build();

        scheduledFlight = ChuyenBay.builder()
                .maChuyenBay(1)
                .maChuyenBayCode("VN123")
                .sanBayDi(sanBaySGN)
                .sanBayDen(sanBayHAN)
                .ngayGioBay(LocalDateTime.now().plusDays(7))
                .thoiGianBay(120)
                .giaCoBan(BigDecimal.valueOf(1200000))
                .trangThaiChuyenBay("SCHEDULED")
                .isDeleted(false)
                .build();
    }

    // ─── createFlight ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createFlight()")
    class CreateFlightTests {

        @Test
        @DisplayName("Tạo chuyến bay thành công")
        void createFlight_success() {
            when(chuyenBayRepository.existsByMaChuyenBayCode("VN456")).thenReturn(false);
            when(sanBayRepository.findById("SGN")).thenReturn(Optional.of(sanBaySGN));
            when(sanBayRepository.findById("DAD")).thenReturn(Optional.of(
                    SanBay.builder().maSanBay("DAD").tenSanBay("Đà Nẵng").thanhPho("Đà Nẵng").build()));
            when(chuyenBayRepository.save(any())).thenAnswer(inv -> {
                ChuyenBay cb = inv.getArgument(0);
                cb.setMaChuyenBay(2);
                return cb;
            });
            when(chiTietHangVeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(chuyenBayRepository.findById(2)).thenReturn(Optional.of(ChuyenBay.builder()
                    .maChuyenBay(2).maChuyenBayCode("VN456")
                    .sanBayDi(sanBaySGN)
                    .sanBayDen(SanBay.builder().maSanBay("DAD").tenSanBay("Đà Nẵng").thanhPho("Đà Nẵng").build())
                    .ngayGioBay(LocalDateTime.now().plusDays(10))
                    .thoiGianBay(75)
                    .giaCoBan(BigDecimal.valueOf(900000))
                    .trangThaiChuyenBay("SCHEDULED")
                    .isDeleted(false)
                    .build()));
            when(chiTietHangVeRepository.findByMaChuyenBay(2)).thenReturn(Collections.emptyList());

            CreateFlightRequest request = new CreateFlightRequest();
            request.setMaChuyenBayCode("VN456");
            request.setSanBayDi("SGN");
            request.setSanBayDen("DAD");
            request.setNgayGioBay(LocalDateTime.now().plusDays(10));
            request.setThoiGianBay(75);
            request.setGiaCoBan(BigDecimal.valueOf(900000));
            request.setDanhSachHangVe(List.of(
                    createHangVeInput(1, 150, 900000),
                    createHangVeInput(2, 20, 2500000)));
            request.setDanhSachTrungGian(Collections.emptyList());

            FlightResponse result = flightService.createFlight(request);

            assertThat(result.getMaChuyenBayCode()).isEqualTo("VN456");
            verify(chuyenBayRepository).save(any(ChuyenBay.class));
        }

        @Test
        @DisplayName("Tạo chuyến bay thất bại: sân bay đi và đến trùng nhau")
        void createFlight_sameAirport_throwsBusinessException() {
            CreateFlightRequest request = new CreateFlightRequest();
            request.setMaChuyenBayCode("VN999");
            request.setSanBayDi("SGN");
            request.setSanBayDen("SGN");
            request.setNgayGioBay(LocalDateTime.now().plusDays(5));
            request.setThoiGianBay(60);
            request.setGiaCoBan(BigDecimal.valueOf(500000));
            request.setDanhSachHangVe(Collections.emptyList());
            request.setDanhSachTrungGian(Collections.emptyList());

            assertThatThrownBy(() -> flightService.createFlight(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("trùng nhau");
        }

        @Test
        @DisplayName("Tạo chuyến bay thất bại: mã chuyến bay đã tồn tại")
        void createFlight_duplicateCode_throwsConflict() {
            when(chuyenBayRepository.existsByMaChuyenBayCode("VN123")).thenReturn(true);

            CreateFlightRequest request = new CreateFlightRequest();
            request.setMaChuyenBayCode("VN123");
            request.setSanBayDi("SGN");
            request.setSanBayDen("HAN");
            request.setNgayGioBay(LocalDateTime.now().plusDays(5));
            request.setThoiGianBay(120);
            request.setGiaCoBan(BigDecimal.valueOf(1200000));
            request.setDanhSachHangVe(Collections.emptyList());
            request.setDanhSachTrungGian(Collections.emptyList());

            assertThatThrownBy(() -> flightService.createFlight(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("đã tồn tại");
        }

        @Test
        @DisplayName("Tạo chuyến bay thất bại: vượt quá 2 sân bay trung gian")
        void createFlight_tooManyStopovers_throwsBusinessException() {
            when(chuyenBayRepository.existsByMaChuyenBayCode("VN789")).thenReturn(false);
            when(sanBayRepository.findById("SGN")).thenReturn(Optional.of(sanBaySGN));
            when(sanBayRepository.findById("HAN")).thenReturn(Optional.of(sanBayHAN));

            CreateFlightRequest.TrungGianInput tg1 = new CreateFlightRequest.TrungGianInput();
            tg1.setMaSanBay("DAD"); tg1.setThuTu(1); tg1.setThoiGianDung(60);
            CreateFlightRequest.TrungGianInput tg2 = new CreateFlightRequest.TrungGianInput();
            tg2.setMaSanBay("CXR"); tg2.setThuTu(2); tg2.setThoiGianDung(60);
            CreateFlightRequest.TrungGianInput tg3 = new CreateFlightRequest.TrungGianInput();
            tg3.setMaSanBay("VCA"); tg3.setThuTu(3); tg3.setThoiGianDung(60);

            CreateFlightRequest request = new CreateFlightRequest();
            request.setMaChuyenBayCode("VN789");
            request.setSanBayDi("SGN");
            request.setSanBayDen("HAN");
            request.setNgayGioBay(LocalDateTime.now().plusDays(5));
            request.setThoiGianBay(240);
            request.setGiaCoBan(BigDecimal.valueOf(1500000));
            request.setDanhSachHangVe(Collections.emptyList());
            request.setDanhSachTrungGian(List.of(tg1, tg2, tg3));

            assertThatThrownBy(() -> flightService.createFlight(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("2 sân bay trung gian");
        }

        @Test
        @DisplayName("Tạo chuyến bay thất bại: không tìm thấy sân bay đi")
        void createFlight_airportNotFound_throwsResourceNotFound() {
            when(chuyenBayRepository.existsByMaChuyenBayCode("VN999")).thenReturn(false);
            when(sanBayRepository.findById("XXX")).thenReturn(Optional.empty());

            CreateFlightRequest request = new CreateFlightRequest();
            request.setMaChuyenBayCode("VN999");
            request.setSanBayDi("XXX");
            request.setSanBayDen("HAN");
            request.setNgayGioBay(LocalDateTime.now().plusDays(5));
            request.setThoiGianBay(120);
            request.setGiaCoBan(BigDecimal.valueOf(1200000));
            request.setDanhSachHangVe(Collections.emptyList());
            request.setDanhSachTrungGian(Collections.emptyList());

            assertThatThrownBy(() -> flightService.createFlight(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── getFlightById ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getFlightById()")
    class GetFlightByIdTests {

        @Test
        @DisplayName("Lấy thông tin chuyến bay theo ID thành công")
        void getFlightById_success() {
            when(chuyenBayRepository.findById(1)).thenReturn(Optional.of(scheduledFlight));
            when(chiTietHangVeRepository.findByMaChuyenBay(1)).thenReturn(Collections.emptyList());

            FlightResponse result = flightService.getFlightById(1);

            assertThat(result.getMaChuyenBay()).isEqualTo(1);
            assertThat(result.getMaChuyenBayCode()).isEqualTo("VN123");
            assertThat(result.getSanBayDi().getMaSanBay()).isEqualTo("SGN");
        }

        @Test
        @DisplayName("Lấy chuyến bay thất bại: không tìm thấy ID")
        void getFlightById_notFound_throwsResourceNotFound() {
            when(chuyenBayRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flightService.getFlightById(999))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Lấy chuyến bay thất bại: chuyến bay đã bị xóa")
        void getFlightById_deleted_throwsResourceNotFound() {
            ChuyenBay deletedFlight = ChuyenBay.builder()
                    .maChuyenBay(5)
                    .maChuyenBayCode("VN999")
                    .sanBayDi(sanBaySGN)
                    .sanBayDen(sanBayHAN)
                    .trangThaiChuyenBay("CANCELLED")
                    .isDeleted(true)
                    .build();

            when(chuyenBayRepository.findById(5)).thenReturn(Optional.of(deletedFlight));

            assertThatThrownBy(() -> flightService.getFlightById(5))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── updateFlight ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateFlight()")
    class UpdateFlightTests {

        @Test
        @DisplayName("Cập nhật chuyến bay thành công")
        void updateFlight_success() {
            when(chuyenBayRepository.findById(1)).thenReturn(Optional.of(scheduledFlight));
            when(chuyenBayRepository.save(any())).thenReturn(scheduledFlight);
            when(chiTietHangVeRepository.findByMaChuyenBay(1)).thenReturn(Collections.emptyList());

            UpdateFlightRequest request = new UpdateFlightRequest();
            request.setGiaCoBan(BigDecimal.valueOf(1300000));

            FlightResponse result = flightService.updateFlight(1, request);

            assertThat(result).isNotNull();
            verify(chuyenBayRepository).save(any());
        }

        @Test
        @DisplayName("Cập nhật thất bại: chuyến bay đã hủy")
        void updateFlight_cancelled_throwsBusinessException() {
            ChuyenBay cancelledFlight = ChuyenBay.builder()
                    .maChuyenBay(2)
                    .maChuyenBayCode("VN222")
                    .sanBayDi(sanBaySGN)
                    .sanBayDen(sanBayHAN)
                    .trangThaiChuyenBay("CANCELLED")
                    .isDeleted(false)
                    .build();

            when(chuyenBayRepository.findById(2)).thenReturn(Optional.of(cancelledFlight));

            assertThatThrownBy(() -> flightService.updateFlight(2, new UpdateFlightRequest()))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã hủy");
        }

        @Test
        @DisplayName("Cập nhật thất bại: không tìm thấy chuyến bay")
        void updateFlight_notFound_throwsResourceNotFound() {
            when(chuyenBayRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flightService.updateFlight(999, new UpdateFlightRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Cập nhật thất bại: quá 2 sân bay trung gian")
        void updateFlight_tooManyStopovers_throwsBusinessException() {
            when(chuyenBayRepository.findById(1)).thenReturn(Optional.of(scheduledFlight));

            UpdateFlightRequest request = new UpdateFlightRequest();
            CreateFlightRequest.TrungGianInput tg1 = new CreateFlightRequest.TrungGianInput();
            CreateFlightRequest.TrungGianInput tg2 = new CreateFlightRequest.TrungGianInput();
            CreateFlightRequest.TrungGianInput tg3 = new CreateFlightRequest.TrungGianInput();
            request.setDanhSachTrungGian(List.of(tg1, tg2, tg3));

            assertThatThrownBy(() -> flightService.updateFlight(1, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("2 sân bay trung gian");
        }
    }

    // ─── cancelFlight ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("cancelFlight()")
    class CancelFlightTests {

        @Test
        @DisplayName("Hủy chuyến bay thành công")
        void cancelFlight_success() {
            when(chuyenBayRepository.findById(1)).thenReturn(Optional.of(scheduledFlight));
            when(chuyenBayRepository.save(any())).thenReturn(scheduledFlight);

            assertThatCode(() -> flightService.cancelFlight(1)).doesNotThrowAnyException();

            verify(chuyenBayRepository).save(argThat(cb ->
                    "CANCELLED".equals(cb.getTrangThaiChuyenBay()) && cb.getIsDeleted()));
        }

        @Test
        @DisplayName("Hủy thất bại: chuyến bay đã bị hủy trước đó")
        void cancelFlight_alreadyCancelled_throwsBusinessException() {
            ChuyenBay alreadyCancelled = ChuyenBay.builder()
                    .maChuyenBay(3)
                    .maChuyenBayCode("VN333")
                    .sanBayDi(sanBaySGN)
                    .sanBayDen(sanBayHAN)
                    .trangThaiChuyenBay("CANCELLED")
                    .isDeleted(false)
                    .build();

            when(chuyenBayRepository.findById(3)).thenReturn(Optional.of(alreadyCancelled));

            assertThatThrownBy(() -> flightService.cancelFlight(3))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã bị hủy");
        }

        @Test
        @DisplayName("Hủy thất bại: không tìm thấy chuyến bay")
        void cancelFlight_notFound_throwsResourceNotFound() {
            when(chuyenBayRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flightService.cancelFlight(999))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── getAllAirports ───────────────────────────────────────────────────────

    @Test
    @DisplayName("Lấy danh sách tất cả sân bay đang hoạt động")
    void getAllAirports_returnsActiveAirports() {
        when(sanBayRepository.findByIsActiveTrue()).thenReturn(List.of(sanBaySGN, sanBayHAN));

        var airports = flightService.getAllAirports();

        assertThat(airports).hasSize(2);
        assertThat(airports).extracting("maSanBay").containsExactlyInAnyOrder("SGN", "HAN");
    }

    // ─── getFlights (pagination) ──────────────────────────────────────────────

    @Test
    @DisplayName("Lấy danh sách chuyến bay có phân trang")
    void getFlights_returnsPaginatedList() {
        Page<ChuyenBay> page = new PageImpl<>(List.of(scheduledFlight));
        when(chuyenBayRepository.findWithFilters(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);
        when(chiTietHangVeRepository.findByMaChuyenBay(1)).thenReturn(Collections.emptyList());

        FlightSearchRequest request = new FlightSearchRequest();
        request.setPage(0);
        request.setSize(20);
        request.setSort("ngayGioBay,asc");

        ApiResponse<List<FlightResponse>> result = flightService.getFlights(request);

        assertThat(result.getData()).hasSize(1);
        assertThat(result.getPagination().getTotalElements()).isEqualTo(1);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private CreateFlightRequest.HangVeInput createHangVeInput(int maHangVe, int soLuong, long donGia) {
        CreateFlightRequest.HangVeInput input = new CreateFlightRequest.HangVeInput();
        input.setMaHangVe(maHangVe);
        input.setSoLuong(soLuong);
        input.setDonGia(BigDecimal.valueOf(donGia));
        return input;
    }
}
