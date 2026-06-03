package com.vemaybay.service;

import com.vemaybay.dto.checkin.BoardingPassResponse;
import com.vemaybay.dto.checkin.CheckInRequest;

public interface CheckInService {

    BoardingPassResponse checkIn(CheckInRequest request);

    BoardingPassResponse getBoardingPass(Integer maVe);

    BoardingPassResponse getBoardingPassByTicketCode(String maVeCode);
}
