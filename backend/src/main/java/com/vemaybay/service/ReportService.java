package com.vemaybay.service;

import com.vemaybay.dto.report.MonthlyReportRow;
import com.vemaybay.dto.report.YearlyReportRow;

import java.util.List;

public interface ReportService {

    List<MonthlyReportRow> getMonthlyReport(int year, int month);

    List<YearlyReportRow> getYearlyReport(int year);

    byte[] exportMonthlyReportExcel(int year, int month);

    byte[] exportYearlyReportExcel(int year);
}
