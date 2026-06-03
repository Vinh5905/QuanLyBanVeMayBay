package com.vemaybay.controller;

import com.vemaybay.dto.ApiResponse;
import com.vemaybay.dto.report.MonthlyReportRow;
import com.vemaybay.dto.report.YearlyReportRow;
import com.vemaybay.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('Admin', 'NhanVien')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyReportRow>>> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMonthlyReport(year, month)));
    }

    @GetMapping("/yearly")
    public ResponseEntity<ApiResponse<List<YearlyReportRow>>> getYearlyReport(
            @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getYearlyReport(year)));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "excel") String format) {
        byte[] data = month != null
                ? reportService.exportMonthlyReportExcel(year, month)
                : reportService.exportYearlyReportExcel(year);

        String filename = month != null
                ? "bao-cao-thang-" + month + "-" + year + ".xlsx"
                : "bao-cao-nam-" + year + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setContentLength(data.length);

        return ResponseEntity.ok().headers(headers).body(data);
    }
}
