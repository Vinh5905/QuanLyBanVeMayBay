package com.vemaybay.service.impl;

import com.vemaybay.dto.dashboard.DashboardSummaryResponse;
import com.vemaybay.dto.dashboard.RevenueChartResponse;
import com.vemaybay.dto.dashboard.TicketClassChartResponse;
import com.vemaybay.dto.flight.FlightResponse;
import com.vemaybay.dto.flight.FlightSearchRequest;
import com.vemaybay.dto.ticket.TicketResponse;
import com.vemaybay.dto.ticket.TicketSearchRequest;
import com.vemaybay.service.DashboardService;
import com.vemaybay.service.FlightService;
import com.vemaybay.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final JdbcTemplate jdbcTemplate;
    private final TicketService ticketService;
    private final FlightService flightService;

    @Override
    public DashboardSummaryResponse getSummary() {
        return jdbcTemplate.queryForObject(
                "SELECT TongVeHomNay, DoanhThuHomNay, SoChuyenBayHomNay, SoKhachMoiThangNay " +
                "FROM dbo.vw_DashboardSummary",
                (rs, rowNum) -> DashboardSummaryResponse.builder()
                        .tongVeHomNay(rs.getInt("TongVeHomNay"))
                        .doanhThuHomNay(rs.getBigDecimal("DoanhThuHomNay"))
                        .soChuyenBayHomNay(rs.getInt("SoChuyenBayHomNay"))
                        .soKhachMoiThangNay(rs.getInt("SoKhachMoiThangNay"))
                        .build()
        );
    }

    @Override
    public List<RevenueChartResponse> getRevenueChart() {
        return jdbcTemplate.query(
                "SELECT CAST(ThoiGianThanhToan AS DATE) AS Ngay, " +
                "       ISNULL(SUM(SoTien), 0) AS DoanhThu " +
                "FROM dbo.THANHTOAN " +
                "WHERE TrangThaiThanhToan = 'COMPLETED' " +
                "  AND ThoiGianThanhToan >= DATEADD(DAY, -29, CAST(SYSUTCDATETIME() AS DATE)) " +
                "GROUP BY CAST(ThoiGianThanhToan AS DATE) " +
                "ORDER BY Ngay",
                (rs, rowNum) -> RevenueChartResponse.builder()
                        .ngay(rs.getDate("Ngay") != null ? rs.getDate("Ngay").toLocalDate() : null)
                        .doanhThu(rs.getBigDecimal("DoanhThu"))
                        .build()
        );
    }

    @Override
    public List<TicketClassChartResponse> getTicketClassChart() {
        List<Object[]> raw = jdbcTemplate.query(
                "SELECT hv.TenHangVe, COUNT(*) AS SoLuong " +
                "FROM dbo.VE v " +
                "JOIN dbo.HANGVE hv ON v.MaHangVe = hv.MaHangVe " +
                "WHERE v.IsDeleted = 0 AND v.TrangThaiVe = 'HOP_LE' " +
                "GROUP BY hv.TenHangVe",
                (rs, rowNum) -> new Object[]{
                        rs.getString("TenHangVe"),
                        rs.getLong("SoLuong")
                }
        );

        long total = raw.stream().mapToLong(r -> (Long) r[1]).sum();

        return raw.stream().map(r -> {
            long count = (Long) r[1];
            double pct = total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0;
            return TicketClassChartResponse.builder()
                    .hangVe((String) r[0])
                    .soLuong(count)
                    .phanTram(pct)
                    .build();
        }).toList();
    }

    @Override
    public List<TicketResponse> getRecentTickets() {
        TicketSearchRequest req = new TicketSearchRequest();
        req.setTrangThaiVe("HOP_LE");
        req.setPage(0);
        req.setSize(10);
        req.setSort("createdAt,desc");
        return ticketService.getTickets(req).getData();
    }

    @Override
    public List<FlightResponse> getTodayFlights() {
        FlightSearchRequest req = new FlightSearchRequest();
        req.setNgayBay(LocalDate.now());
        req.setPage(0);
        req.setSize(50);
        req.setSort("ngayGioBay,asc");
        return flightService.getFlights(req).getData();
    }
}
