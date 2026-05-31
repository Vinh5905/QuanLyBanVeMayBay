package com.vemaybay.service.impl;

import com.vemaybay.dto.config.ConfigResponse;
import com.vemaybay.dto.config.UpdateConfigRequest;
import com.vemaybay.entity.ThamSo;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.exception.ResourceNotFoundException;
import com.vemaybay.repository.ThamSoRepository;
import com.vemaybay.security.SecurityUtils;
import com.vemaybay.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {

    private final ThamSoRepository thamSoRepository;

    // Cross-parameter constraint keys
    private static final String KEY_DONG_BAN_VE = "ThoiGianDongBanVe";
    private static final String KEY_DAT_VE_CHAM_NHAT = "TGDatVeChamNhat";
    private static final String KEY_DUNG_TOI_THIEU = "ThoiGianDungToiThieu";
    private static final String KEY_DUNG_TOI_DA = "ThoiGianDungToiDa";

    @Override
    public List<ConfigResponse> getAllConfigs() {
        return thamSoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ConfigResponse getConfig(String key) {
        return toResponse(thamSoRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Tham số", "key", key)));
    }

    @Override
    @Transactional
    public ConfigResponse updateConfig(String key, UpdateConfigRequest request) {
        ThamSo thamSo = thamSoRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Tham số", "key", key));

        validateValue(key, request.getGiaTri());
        validateCrossConstraints(key, request.getGiaTri());

        thamSo.setGiaTri(request.getGiaTri());
        thamSo.setCapNhatBoi(SecurityUtils.getCurrentUserId());
        return toResponse(thamSoRepository.save(thamSo));
    }

    @Override
    @Transactional
    public List<ConfigResponse> batchUpdateConfig(Map<String, String> updates) {
        List<ConfigResponse> results = new ArrayList<>();
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            ThamSo thamSo = thamSoRepository.findById(key)
                    .orElseThrow(() -> new ResourceNotFoundException("Tham số", "key", key));
            validateValue(key, value);
            thamSo.setGiaTri(value);
            thamSo.setCapNhatBoi(SecurityUtils.getCurrentUserId());
            results.add(toResponse(thamSoRepository.save(thamSo)));
        }
        validateBatchCrossConstraints();
        return results;
    }

    private void validateValue(String key, String value) {
        try {
            double numeric = Double.parseDouble(value);
            if (numeric < 0) {
                throw new BusinessException("INVALID_CONFIG_VALUE",
                        "Giá trị tham số '" + key + "' phải là số không âm");
            }
            // Key-specific range validation
            switch (key) {
                case "TuoiMuaVeToiThieu" -> {
                    if (numeric < 1 || numeric > 100)
                        throw new BusinessException("INVALID_CONFIG_VALUE", "Tuổi phải từ 1-100");
                }
                case "TrongLuongToiDaMotKien" -> {
                    if (numeric < 1 || numeric > 50)
                        throw new BusinessException("INVALID_CONFIG_VALUE", "Trọng lượng tối đa phải từ 1-50 kg");
                }
                case "SoKienToiDa" -> {
                    if (numeric < 1 || numeric > 100)
                        throw new BusinessException("INVALID_CONFIG_VALUE", "Số kiện tối đa phải từ 1-100");
                }
                case "ThueVAT" -> {
                    if (numeric < 0 || numeric > 100)
                        throw new BusinessException("INVALID_CONFIG_VALUE", "Thuế VAT phải từ 0-100 %");
                }
            }
        } catch (NumberFormatException e) {
            throw new BusinessException("INVALID_CONFIG_VALUE",
                    "Giá trị tham số '" + key + "' phải là số hợp lệ");
        }
    }

    private void validateCrossConstraints(String updatedKey, String newValue) {
        double newNumeric = Double.parseDouble(newValue);

        if (updatedKey.equals(KEY_DONG_BAN_VE) || updatedKey.equals(KEY_DAT_VE_CHAM_NHAT)) {
            double dongBanVe = updatedKey.equals(KEY_DONG_BAN_VE) ? newNumeric
                    : getNumericValue(KEY_DONG_BAN_VE);
            double datVeChamNhat = updatedKey.equals(KEY_DAT_VE_CHAM_NHAT) ? newNumeric
                    : getNumericValue(KEY_DAT_VE_CHAM_NHAT);
            if (dongBanVe >= datVeChamNhat) {
                throw new BusinessException("CONSTRAINT_VIOLATION",
                        "ThoiGianDongBanVe (" + (int)dongBanVe + " phút) phải nhỏ hơn TGDatVeChamNhat (" + (int)datVeChamNhat + " phút)");
            }
        }

        if (updatedKey.equals(KEY_DUNG_TOI_THIEU) || updatedKey.equals(KEY_DUNG_TOI_DA)) {
            double min = updatedKey.equals(KEY_DUNG_TOI_THIEU) ? newNumeric : getNumericValue(KEY_DUNG_TOI_THIEU);
            double max = updatedKey.equals(KEY_DUNG_TOI_DA) ? newNumeric : getNumericValue(KEY_DUNG_TOI_DA);
            if (min >= max) {
                throw new BusinessException("CONSTRAINT_VIOLATION",
                        "ThoiGianDungToiThieu phải nhỏ hơn ThoiGianDungToiDa");
            }
        }
    }

    private void validateBatchCrossConstraints() {
        double dongBanVe = getNumericValue(KEY_DONG_BAN_VE);
        double datVeChamNhat = getNumericValue(KEY_DAT_VE_CHAM_NHAT);
        if (dongBanVe >= datVeChamNhat) {
            throw new BusinessException("CONSTRAINT_VIOLATION",
                    "ThoiGianDongBanVe phải nhỏ hơn TGDatVeChamNhat sau khi cập nhật");
        }

        double min = getNumericValue(KEY_DUNG_TOI_THIEU);
        double max = getNumericValue(KEY_DUNG_TOI_DA);
        if (min >= max) {
            throw new BusinessException("CONSTRAINT_VIOLATION",
                    "ThoiGianDungToiThieu phải nhỏ hơn ThoiGianDungToiDa sau khi cập nhật");
        }
    }

    private double getNumericValue(String key) {
        return thamSoRepository.findById(key)
                .map(ts -> Double.parseDouble(ts.getGiaTri()))
                .orElse(0.0);
    }

    private ConfigResponse toResponse(ThamSo ts) {
        return ConfigResponse.builder()
                .tenThamSo(ts.getTenThamSo())
                .giaTri(ts.getGiaTri())
                .moTa(ts.getMoTa())
                .capNhatLuc(ts.getCapNhatLuc())
                .capNhatBoi(ts.getCapNhatBoi())
                .build();
    }
}
