package com.vemaybay.service;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.payment.PaymentRequest;
import com.vemaybay.dto.payment.PaymentResponse;
import com.vemaybay.dto.payment.PaymentSearchRequest;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Integer id);

    ApiResponse<List<PaymentResponse>> getPayments(PaymentSearchRequest request);
}
