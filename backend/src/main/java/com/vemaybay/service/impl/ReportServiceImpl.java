package com.vemaybay.service.impl;

import com.vemaybay.dto.report.MonthlyReportRow;
import com.vemaybay.dto.report.YearlyReportRow;
import com.vemaybay.exception.BusinessException;
import com.vemaybay.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<MonthlyReportRow> getMonthlyReport(int year, int month) {
        if (month < 1 || month > 12) {
            throw new BusinessException("INVALID_MONTH", "Tháng không hợp lệ (1-12)");
        }
        return jdbcTemplate.query(
                "{call dbo.sp_Report_DoanhThuThang(?, ?)}",
                ps -> {
                    ps.setInt(1, year);
                    ps.setInt(2, month);
                },
                (rs, rowNum) -> mapMonthlyRow(rs)
        );
    }

    @Override
    public List<YearlyReportRow> getYearlyReport(int year) {
        return jdbcTemplate.query(
                "{call dbo.sp_Report_DoanhThuNam(?)}",
                ps -> ps.setInt(1, year),
                (rs, rowNum) -> YearlyReportRow.builder()
                        .thang(rs.getInt("Thang"))
                        .soChuyenBay(rs.getInt("SoChuyenBay"))
                        .soVe(rs.getInt("SoVe"))
                        .doanhThu(rs.getBigDecimal("DoanhThu"))
                        .phanTram(rs.getDouble("PhanTram"))
                        .build()
        );
    }

    @Override
    public byte[] exportMonthlyReportExcel(int year, int month) {
        List<MonthlyReportRow> rows = getMonthlyReport(year, month);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Báo cáo tháng " + month + "/" + year);

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Number style
            CellStyle numberStyle = workbook.createCellStyle();
            DataFormat fmt = workbook.createDataFormat();
            numberStyle.setDataFormat(fmt.getFormat("#,##0"));

            // Currency style
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(fmt.getFormat("#,##0 \\₫"));

            // Headers
            String[] headers = {
                "Mã chuyến bay", "Sân bay đi", "Sân bay đến",
                "Ngày giờ bay", "Doanh thu vé (đ)", "Doanh thu hành lý (đ)",
                "Tổng doanh thu (đ)", "Số vé bán", "Tỷ lệ (%)"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            BigDecimal totalVe = BigDecimal.ZERO;
            BigDecimal totalHanhLy = BigDecimal.ZERO;
            int totalVeBan = 0;

            for (MonthlyReportRow row : rows) {
                Row dataRow = sheet.createRow(rowNum++);
                dataRow.createCell(0).setCellValue(row.getMaChuyenBayCode());
                dataRow.createCell(1).setCellValue(row.getSanBayDi());
                dataRow.createCell(2).setCellValue(row.getSanBayDen());
                dataRow.createCell(3).setCellValue(
                        row.getNgayGioBay() != null
                                ? row.getNgayGioBay().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                                : "");

                Cell veCell = dataRow.createCell(4);
                veCell.setCellValue(row.getDoanhThuVe() != null ? row.getDoanhThuVe().doubleValue() : 0);
                veCell.setCellStyle(currencyStyle);

                Cell hlCell = dataRow.createCell(5);
                hlCell.setCellValue(row.getDoanhThuHanhLy() != null ? row.getDoanhThuHanhLy().doubleValue() : 0);
                hlCell.setCellStyle(currencyStyle);

                BigDecimal tongDoanhThu = (row.getDoanhThuVe() != null ? row.getDoanhThuVe() : BigDecimal.ZERO)
                        .add(row.getDoanhThuHanhLy() != null ? row.getDoanhThuHanhLy() : BigDecimal.ZERO);
                Cell tongCell = dataRow.createCell(6);
                tongCell.setCellValue(tongDoanhThu.doubleValue());
                tongCell.setCellStyle(currencyStyle);

                Cell vebanCell = dataRow.createCell(7);
                vebanCell.setCellValue(row.getSoVeBan() != null ? row.getSoVeBan() : 0);
                vebanCell.setCellStyle(numberStyle);

                dataRow.createCell(8).setCellValue(
                        row.getPhanTramTrenTong() != null ? row.getPhanTramTrenTong() : 0);

                if (row.getDoanhThuVe() != null) totalVe = totalVe.add(row.getDoanhThuVe());
                if (row.getDoanhThuHanhLy() != null) totalHanhLy = totalHanhLy.add(row.getDoanhThuHanhLy());
                if (row.getSoVeBan() != null) totalVeBan += row.getSoVeBan();
            }

            // Summary row
            Row sumRow = sheet.createRow(rowNum);
            CellStyle sumStyle = workbook.createCellStyle();
            Font sumFont = workbook.createFont();
            sumFont.setBold(true);
            sumStyle.setFont(sumFont);
            Cell sumLabel = sumRow.createCell(0);
            sumLabel.setCellValue("TỔNG CỘNG");
            sumLabel.setCellStyle(sumStyle);

            Cell sumVe = sumRow.createCell(4);
            sumVe.setCellValue(totalVe.doubleValue());
            sumVe.setCellStyle(currencyStyle);

            Cell sumHl = sumRow.createCell(5);
            sumHl.setCellValue(totalHanhLy.doubleValue());
            sumHl.setCellStyle(currencyStyle);

            Cell sumTong = sumRow.createCell(6);
            sumTong.setCellValue(totalVe.add(totalHanhLy).doubleValue());
            sumTong.setCellStyle(currencyStyle);

            Cell sumVeBan = sumRow.createCell(7);
            sumVeBan.setCellValue(totalVeBan);
            sumVeBan.setCellStyle(numberStyle);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("EXPORT_FAILED", "Không thể xuất file Excel: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportYearlyReportExcel(int year) {
        List<YearlyReportRow> rows = getYearlyReport(year);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Báo cáo năm " + year);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            CellStyle numberStyle = workbook.createCellStyle();
            DataFormat fmt = workbook.createDataFormat();
            numberStyle.setDataFormat(fmt.getFormat("#,##0"));

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(fmt.getFormat("#,##0 \\₫"));

            String[] headers = {
                "Tháng", "Số chuyến bay", "Số vé bán", "Doanh thu (đ)", "Tỷ lệ (%)"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            int totalFlights = 0;
            int totalTickets = 0;
            BigDecimal totalRevenue = BigDecimal.ZERO;

            for (YearlyReportRow row : rows) {
                Row dataRow = sheet.createRow(rowNum++);
                dataRow.createCell(0).setCellValue(row.getThang() != null ? row.getThang() : 0);

                Cell flightCell = dataRow.createCell(1);
                flightCell.setCellValue(row.getSoChuyenBay() != null ? row.getSoChuyenBay() : 0);
                flightCell.setCellStyle(numberStyle);

                Cell ticketCell = dataRow.createCell(2);
                ticketCell.setCellValue(row.getSoVe() != null ? row.getSoVe() : 0);
                ticketCell.setCellStyle(numberStyle);

                Cell revenueCell = dataRow.createCell(3);
                revenueCell.setCellValue(row.getDoanhThu() != null ? row.getDoanhThu().doubleValue() : 0);
                revenueCell.setCellStyle(currencyStyle);

                dataRow.createCell(4).setCellValue(row.getPhanTram() != null ? row.getPhanTram() : 0);

                if (row.getSoChuyenBay() != null) totalFlights += row.getSoChuyenBay();
                if (row.getSoVe() != null) totalTickets += row.getSoVe();
                if (row.getDoanhThu() != null) totalRevenue = totalRevenue.add(row.getDoanhThu());
            }

            Row sumRow = sheet.createRow(rowNum);
            CellStyle sumStyle = workbook.createCellStyle();
            Font sumFont = workbook.createFont();
            sumFont.setBold(true);
            sumStyle.setFont(sumFont);

            Cell sumLabel = sumRow.createCell(0);
            sumLabel.setCellValue("TỔNG CỘNG");
            sumLabel.setCellStyle(sumStyle);

            Cell sumFlights = sumRow.createCell(1);
            sumFlights.setCellValue(totalFlights);
            sumFlights.setCellStyle(numberStyle);

            Cell sumTickets = sumRow.createCell(2);
            sumTickets.setCellValue(totalTickets);
            sumTickets.setCellStyle(numberStyle);

            Cell sumRevenue = sumRow.createCell(3);
            sumRevenue.setCellValue(totalRevenue.doubleValue());
            sumRevenue.setCellStyle(currencyStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("EXPORT_FAILED", "Không thể xuất file Excel: " + e.getMessage());
        }
    }

    private MonthlyReportRow mapMonthlyRow(ResultSet rs) throws SQLException {
        Object ngayGioObj = rs.getObject("NgayGioBay");
        LocalDateTime ngayGio = null;
        if (ngayGioObj instanceof java.sql.Timestamp ts) {
            ngayGio = ts.toLocalDateTime();
        }
        return MonthlyReportRow.builder()
                .maChuyenBay(rs.getInt("MaChuyenBay"))
                .maChuyenBayCode(rs.getString("MaChuyenBayCode"))
                .sanBayDi(rs.getString("SanBayDi"))
                .sanBayDen(rs.getString("SanBayDen"))
                .ngayGioBay(ngayGio)
                .doanhThuVe(rs.getBigDecimal("DoanhThuVe"))
                .doanhThuHanhLy(rs.getBigDecimal("DoanhThuHanhLy"))
                .soVeBan(rs.getInt("SoVeBan"))
                .phanTramTrenTong(rs.getDouble("PhanTramTrenTong"))
                .build();
    }
}
