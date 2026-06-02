package com.vemaybay.service;

import com.vemaybay.dto.customer.CreateCustomerRequest;
import com.vemaybay.dto.customer.CustomerResponse;

import java.util.List;

public interface CustomerService {

    List<CustomerResponse> searchByCccd(String cccd);

    CustomerResponse createCustomer(CreateCustomerRequest request);
}
