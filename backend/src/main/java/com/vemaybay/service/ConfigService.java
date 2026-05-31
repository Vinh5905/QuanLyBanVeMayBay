package com.vemaybay.service;

import com.vemaybay.dto.config.ConfigResponse;
import com.vemaybay.dto.config.UpdateConfigRequest;

import java.util.List;
import java.util.Map;

public interface ConfigService {

    List<ConfigResponse> getAllConfigs();

    ConfigResponse getConfig(String key);

    ConfigResponse updateConfig(String key, UpdateConfigRequest request);

    List<ConfigResponse> batchUpdateConfig(Map<String, String> updates);
}
