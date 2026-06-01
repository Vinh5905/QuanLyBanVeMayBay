package com.vemaybay.service;

import com.vemaybay.dto.baggage.BaggagePricingResponse;
import com.vemaybay.dto.baggage.BaggageResponse;
import com.vemaybay.dto.baggage.RegisterBaggageRequest;

import java.util.List;

public interface BaggageService {

    List<BaggagePricingResponse> getPricing();

    BaggageResponse registerBaggage(RegisterBaggageRequest request);

    List<BaggageResponse> getBaggageByTicket(Integer maVe);

    void cancelBaggage(Integer id);
}
