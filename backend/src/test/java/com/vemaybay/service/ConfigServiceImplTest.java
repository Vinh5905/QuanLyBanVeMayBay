package com.vemaybay.service;

import com.vemaybay.dto.config.ConfigResponse;
import com.vemaybay.dto.config.UpdateConfigRequest;
import com.vemaybay.entity.ThamSo;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.ThamSoRepository;
import com.vemaybay.security.UserPrincipal;
import com.vemaybay.service.impl.ConfigServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConfigServiceImpl Unit Tests")
class ConfigServiceImplTest {

    @Mock ThamSoRepository thamSoRepository;

    @InjectMocks ConfigServiceImpl configService;

    @BeforeEach
    void setSecurityContext() {
        UserPrincipal principal = new UserPrincipal(1, "admin", "Admin");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_Admin")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private ThamSo buildThamSo(String key, String value) {
        return ThamSo.builder()
                .tenThamSo(key)
                .giaTri(value)
                .moTa("Mô tả " + key)
                .capNhatLuc(LocalDateTime.now())
                .build();
    }

    // ─── getAllConfigs ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAllConfigs()")
    class GetAllConfigsTests {

        @Test
        @DisplayName("Lấy tất cả tham số thành công")
        void getAllConfigs_success() {
            when(thamSoRepository.findAll()).thenReturn(List.of(
                    buildThamSo("ThoiGianDongBanVe", "45"),
                    buildThamSo("TGDatVeChamNhat", "120"),
                    buildThamSo("ThueVAT", "10")));

            List<ConfigResponse> result = configService.getAllConfigs();

            assertThat(result).hasSize(3);
            assertThat(result).extracting("tenThamSo")
                    .containsExactlyInAnyOrder("ThoiGianDongBanVe", "TGDatVeChamNhat", "ThueVAT");
        }

        @Test
        @DisplayName("Lấy tất cả tham số trả danh sách rỗng khi không có dữ liệu")
        void getAllConfigs_empty_returnsEmptyList() {
            when(thamSoRepository.findAll()).thenReturn(List.of());

            List<ConfigResponse> result = configService.getAllConfigs();

            assertThat(result).isEmpty();
        }
    }

    // ─── getConfig ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getConfig()")
    class GetConfigTests {

        @Test
        @DisplayName("Lấy tham số theo key thành công")
        void getConfig_success() {
            when(thamSoRepository.findById("ThueVAT"))
                    .thenReturn(Optional.of(buildThamSo("ThueVAT", "10")));

            ConfigResponse result = configService.getConfig("ThueVAT");

            assertThat(result.getTenThamSo()).isEqualTo("ThueVAT");
            assertThat(result.getGiaTri()).isEqualTo("10");
        }

        @Test
        @DisplayName("Lấy tham số thất bại: key không tồn tại")
        void getConfig_notFound_throwsResourceNotFound() {
            when(thamSoRepository.findById("UNKNOWN_KEY")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> configService.getConfig("UNKNOWN_KEY"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── updateConfig ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateConfig() - Validation giá trị")
    class UpdateConfigValidationTests {

        @Test
        @DisplayName("Cập nhật tham số thành công với giá trị hợp lệ")
        void updateConfig_validValue_success() {
            ThamSo thueVAT = buildThamSo("ThueVAT", "10");
            when(thamSoRepository.findById("ThueVAT")).thenReturn(Optional.of(thueVAT));
            when(thamSoRepository.save(any())).thenReturn(thueVAT);

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("15");

            ConfigResponse result = configService.updateConfig("ThueVAT", request);

            assertThat(result).isNotNull();
            verify(thamSoRepository).save(argThat(ts -> "15".equals(ts.getGiaTri())));
        }

        @Test
        @DisplayName("Cập nhật thất bại: giá trị không phải số")
        void updateConfig_nonNumeric_throwsBusinessException() {
            ThamSo ts = buildThamSo("ThoiGianDongBanVe", "45");
            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("abc");

            assertThatThrownBy(() -> configService.updateConfig("ThoiGianDongBanVe", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("số hợp lệ");
        }

        @Test
        @DisplayName("Cập nhật thất bại: giá trị âm")
        void updateConfig_negativeValue_throwsBusinessException() {
            ThamSo ts = buildThamSo("ThoiGianDongBanVe", "45");
            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("-5");

            assertThatThrownBy(() -> configService.updateConfig("ThoiGianDongBanVe", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("không âm");
        }

        @Test
        @DisplayName("Cập nhật TuoiMuaVeToiThieu thất bại: tuổi vượt khoảng 1-100")
        void updateConfig_tuoiOutOfRange_throwsBusinessException() {
            ThamSo ts = buildThamSo("TuoiMuaVeToiThieu", "18");
            when(thamSoRepository.findById("TuoiMuaVeToiThieu")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("200"); // > 100

            assertThatThrownBy(() -> configService.updateConfig("TuoiMuaVeToiThieu", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("1-100");
        }

        @Test
        @DisplayName("Cập nhật TuoiMuaVeToiThieu thất bại: tuổi = 0")
        void updateConfig_tuoiZero_throwsBusinessException() {
            ThamSo ts = buildThamSo("TuoiMuaVeToiThieu", "18");
            when(thamSoRepository.findById("TuoiMuaVeToiThieu")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("0"); // < 1

            assertThatThrownBy(() -> configService.updateConfig("TuoiMuaVeToiThieu", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("1-100");
        }

        @Test
        @DisplayName("Cập nhật ThueVAT thất bại: thuế vượt 100%")
        void updateConfig_thueVATOver100_throwsBusinessException() {
            ThamSo ts = buildThamSo("ThueVAT", "10");
            when(thamSoRepository.findById("ThueVAT")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("101");

            assertThatThrownBy(() -> configService.updateConfig("ThueVAT", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("0-100");
        }

        @Test
        @DisplayName("Cập nhật TrongLuongToiDaMotKien thất bại: trọng lượng vượt 50kg")
        void updateConfig_weightOver50_throwsBusinessException() {
            ThamSo ts = buildThamSo("TrongLuongToiDaMotKien", "32");
            when(thamSoRepository.findById("TrongLuongToiDaMotKien")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("60");

            assertThatThrownBy(() -> configService.updateConfig("TrongLuongToiDaMotKien", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("1-50");
        }

        @Test
        @DisplayName("Cập nhật SoKienToiDa thất bại: số kiện vượt 100")
        void updateConfig_soKienOver100_throwsBusinessException() {
            ThamSo ts = buildThamSo("SoKienToiDa", "15");
            when(thamSoRepository.findById("SoKienToiDa")).thenReturn(Optional.of(ts));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("200");

            assertThatThrownBy(() -> configService.updateConfig("SoKienToiDa", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("1-100");
        }

        @Test
        @DisplayName("Cập nhật thất bại: key không tồn tại")
        void updateConfig_keyNotFound_throwsResourceNotFound() {
            when(thamSoRepository.findById("NONEXISTENT")).thenReturn(Optional.empty());

            UpdateConfigRequest req = new UpdateConfigRequest();
            req.setGiaTri("50");
            assertThatThrownBy(() -> configService.updateConfig("NONEXISTENT", req))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── updateConfig - Cross-constraint ─────────────────────────────────────

    @Nested
    @DisplayName("updateConfig() - Ràng buộc liên tham số")
    class CrossConstraintTests {

        @Test
        @DisplayName("Cập nhật ThoiGianDongBanVe vi phạm ràng buộc: >= TGDatVeChamNhat")
        void updateConfig_dongBanVeGeqDatVe_throwsBusinessException() {
            ThamSo dongBanVe = buildThamSo("ThoiGianDongBanVe", "45");
            ThamSo datVe = buildThamSo("TGDatVeChamNhat", "120");

            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(dongBanVe));
            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(datVe));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("150"); // 150 >= 120 → vi phạm

            assertThatThrownBy(() -> configService.updateConfig("ThoiGianDongBanVe", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("ThoiGianDongBanVe")
                    .hasMessageContaining("TGDatVeChamNhat");
        }

        @Test
        @DisplayName("Cập nhật TGDatVeChamNhat vi phạm ràng buộc: <= ThoiGianDongBanVe")
        void updateConfig_datVeLeqDongBanVe_throwsBusinessException() {
            ThamSo dongBanVe = buildThamSo("ThoiGianDongBanVe", "45");
            ThamSo datVe = buildThamSo("TGDatVeChamNhat", "120");

            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(datVe));
            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(dongBanVe));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("30"); // 45 >= 30 → vi phạm

            assertThatThrownBy(() -> configService.updateConfig("TGDatVeChamNhat", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("ThoiGianDongBanVe")
                    .hasMessageContaining("TGDatVeChamNhat");
        }

        @Test
        @DisplayName("Cập nhật ThoiGianDongBanVe hợp lệ: 45 < 120 → thành công")
        void updateConfig_dongBanVeValid_success() {
            ThamSo dongBanVe = buildThamSo("ThoiGianDongBanVe", "45");
            ThamSo datVe = buildThamSo("TGDatVeChamNhat", "120");

            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(dongBanVe));
            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(datVe));
            when(thamSoRepository.save(any())).thenReturn(dongBanVe);

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("60"); // 60 < 120 → hợp lệ

            assertThatCode(() -> configService.updateConfig("ThoiGianDongBanVe", request))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Cập nhật ThoiGianDungToiThieu vi phạm: >= ThoiGianDungToiDa")
        void updateConfig_dungToiThieuGeqToiDa_throwsBusinessException() {
            ThamSo min = buildThamSo("ThoiGianDungToiThieu", "45");
            ThamSo max = buildThamSo("ThoiGianDungToiDa", "120");

            when(thamSoRepository.findById("ThoiGianDungToiThieu")).thenReturn(Optional.of(min));
            when(thamSoRepository.findById("ThoiGianDungToiDa")).thenReturn(Optional.of(max));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("120"); // 120 >= 120 → vi phạm

            assertThatThrownBy(() -> configService.updateConfig("ThoiGianDungToiThieu", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("ThoiGianDungToiThieu")
                    .hasMessageContaining("ThoiGianDungToiDa");
        }

        @Test
        @DisplayName("Cập nhật ThoiGianDungToiDa vi phạm: <= ThoiGianDungToiThieu")
        void updateConfig_dungToiDaLeqToiThieu_throwsBusinessException() {
            ThamSo min = buildThamSo("ThoiGianDungToiThieu", "45");
            ThamSo max = buildThamSo("ThoiGianDungToiDa", "120");

            when(thamSoRepository.findById("ThoiGianDungToiDa")).thenReturn(Optional.of(max));
            when(thamSoRepository.findById("ThoiGianDungToiThieu")).thenReturn(Optional.of(min));

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("40"); // 45 >= 40 → vi phạm

            assertThatThrownBy(() -> configService.updateConfig("ThoiGianDungToiDa", request))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Cập nhật ThoiGianDungToiThieu hợp lệ: 60 < 120 → thành công")
        void updateConfig_dungToiThieuValid_success() {
            ThamSo min = buildThamSo("ThoiGianDungToiThieu", "45");
            ThamSo max = buildThamSo("ThoiGianDungToiDa", "120");

            when(thamSoRepository.findById("ThoiGianDungToiThieu")).thenReturn(Optional.of(min));
            when(thamSoRepository.findById("ThoiGianDungToiDa")).thenReturn(Optional.of(max));
            when(thamSoRepository.save(any())).thenReturn(min);

            UpdateConfigRequest request = new UpdateConfigRequest();
            request.setGiaTri("60"); // 60 < 120 → hợp lệ

            assertThatCode(() -> configService.updateConfig("ThoiGianDungToiThieu", request))
                    .doesNotThrowAnyException();
        }
    }

    // ─── batchUpdateConfig ────────────────────────────────────────────────────

    @Nested
    @DisplayName("batchUpdateConfig()")
    class BatchUpdateConfigTests {

        @Test
        @DisplayName("Cập nhật hàng loạt thành công")
        void batchUpdateConfig_success() {
            ThamSo dongBanVe = buildThamSo("ThoiGianDongBanVe", "45");
            ThamSo datVe = buildThamSo("TGDatVeChamNhat", "120");
            ThamSo min = buildThamSo("ThoiGianDungToiThieu", "45");
            ThamSo max = buildThamSo("ThoiGianDungToiDa", "120");

            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(dongBanVe));
            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(datVe));
            when(thamSoRepository.findById("ThoiGianDungToiThieu")).thenReturn(Optional.of(min));
            when(thamSoRepository.findById("ThoiGianDungToiDa")).thenReturn(Optional.of(max));
            when(thamSoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // After save: return updated values for cross-constraint check
            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(buildThamSo("ThoiGianDongBanVe", "30")));
            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(buildThamSo("TGDatVeChamNhat", "90")));

            Map<String, String> updates = Map.of(
                    "ThoiGianDongBanVe", "30",
                    "TGDatVeChamNhat", "90");

            assertThatCode(() -> configService.batchUpdateConfig(updates)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Cập nhật hàng loạt thất bại: ràng buộc bị vi phạm sau khi save")
        void batchUpdateConfig_constraintViolated_throwsBusinessException() {
            ThamSo dongBanVe = buildThamSo("ThoiGianDongBanVe", "45");
            ThamSo datVe = buildThamSo("TGDatVeChamNhat", "120");

            when(thamSoRepository.findById("ThoiGianDongBanVe")).thenReturn(Optional.of(dongBanVe));
            when(thamSoRepository.findById("TGDatVeChamNhat")).thenReturn(Optional.of(datVe));
            when(thamSoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Sau khi save: dongBanVe = 100, datVe = 50 → validateBatchCrossConstraints vi phạm
            when(thamSoRepository.findById("ThoiGianDongBanVe"))
                    .thenReturn(Optional.of(buildThamSo("ThoiGianDongBanVe", "100")));
            when(thamSoRepository.findById("TGDatVeChamNhat"))
                    .thenReturn(Optional.of(buildThamSo("TGDatVeChamNhat", "50")));

            Map<String, String> updates = Map.of(
                    "ThoiGianDongBanVe", "100",
                    "TGDatVeChamNhat", "50");

            assertThatThrownBy(() -> configService.batchUpdateConfig(updates))
                    .isInstanceOf(BusinessException.class);
        }
    }
}
