package com.vemaybay.service;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.account.AccountResponse;
import com.vemaybay.dto.account.AccountSearchRequest;
import com.vemaybay.dto.account.CreateAccountRequest;
import com.vemaybay.dto.account.UpdateAccountRequest;

import java.util.List;

public interface AccountService {

    ApiResponse<List<AccountResponse>> getAccounts(AccountSearchRequest request);

    AccountResponse getAccountById(Integer id);

    AccountResponse createAccount(CreateAccountRequest request);

    AccountResponse updateAccount(Integer id, UpdateAccountRequest request);

    void setAccountStatus(Integer id, boolean active);

    void resetPassword(Integer id, String newPassword);
}
