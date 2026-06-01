package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
                "service", "vemaybay-backend",
                "version", "1.0.0",
                "serverTime", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data, "Service is running"));
    }
}
