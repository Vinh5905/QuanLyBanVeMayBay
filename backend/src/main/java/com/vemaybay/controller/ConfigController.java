package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.config.BatchUpdateConfigRequest;
import com.vemaybay.dto.config.ConfigResponse;
import com.vemaybay.dto.config.UpdateConfigRequest;
import com.vemaybay.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
public class ConfigController {

    private final ConfigService configService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConfigResponse>>> getAllConfigs() {
        return ResponseEntity.ok(ApiResponse.success(configService.getAllConfigs()));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<ConfigResponse>> getConfig(
            @PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(configService.getConfig(key)));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ApiResponse<ConfigResponse>> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody UpdateConfigRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(configService.updateConfig(key, request), "Cập nhật tham số thành công"));
    }

    @PutMapping("/batch")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<ApiResponse<List<ConfigResponse>>> batchUpdateConfig(
            @Valid @RequestBody BatchUpdateConfigRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(configService.batchUpdateConfig(request.getThamSo()),
                        "Cập nhật " + request.getThamSo().size() + " tham số thành công"));
    }
}
