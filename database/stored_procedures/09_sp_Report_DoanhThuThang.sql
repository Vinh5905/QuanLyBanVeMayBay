USE [$(DB_NAME)];
GO

-- Monthly revenue report: per-flight breakdown of ticket and baggage revenue.
-- Uses CTEs to avoid double-counting from multi-table JOINs.
CREATE OR ALTER PROCEDURE dbo.sp_Report_DoanhThuThang
    @Nam    INT,
    @Thang  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Thang < 1 OR @Thang > 12
    BEGIN
        SELECT 8001 AS ErrorCode, N'Tháng không hợp lệ (1-12)' AS Message;
        RETURN;
    END;

    -- Doanh thu vé theo chuyến (chỉ COMPLETED payment)
    ;WITH DoanhThuVe AS (
        SELECT
            v.MaChuyenBay,
            SUM(t.SoTien)          AS DoanhThuVe,
            COUNT(DISTINCT v.MaVe) AS SoVeBan
        FROM dbo.VE v
        INNER JOIN dbo.THANHTOAN t
            ON v.MaVe = t.MaVe AND t.TrangThaiThanhToan = 'COMPLETED'
        WHERE v.IsDeleted    = 0
          AND v.TrangThaiVe  = 'HOP_LE'
        GROUP BY v.MaChuyenBay
    ),
    -- Doanh thu hành lý theo chuyến
    DoanhThuHanhLy AS (
        SELECT
            v.MaChuyenBay,
            SUM(gh.TongPhi) AS DoanhThuHanhLy
        FROM dbo.VE v
        INNER JOIN dbo.GOIHANHLY gh ON v.MaVe = gh.MaVe
        WHERE v.IsDeleted = 0
        GROUP BY v.MaChuyenBay
    ),
    -- Tổng doanh thu tháng (dùng để tính % phân bổ)
    TongThang AS (
        SELECT
            ISNULL(SUM(dv.DoanhThuVe), 0)
            + ISNULL(SUM(dh.DoanhThuHanhLy), 0) AS TongTong
        FROM dbo.CHUYENBAY cb
        LEFT JOIN DoanhThuVe      dv ON cb.MaChuyenBay = dv.MaChuyenBay
        LEFT JOIN DoanhThuHanhLy  dh ON cb.MaChuyenBay = dh.MaChuyenBay
        WHERE YEAR(cb.NgayGioBay)  = @Nam
          AND MONTH(cb.NgayGioBay) = @Thang
          AND cb.IsDeleted         = 0
    )
    SELECT
        cb.MaChuyenBay,
        cb.MaChuyenBayCode,
        cb.SanBayDi,
        cb.SanBayDen,
        cb.NgayGioBay,
        ISNULL(dv.DoanhThuVe,        0) AS DoanhThuVe,
        ISNULL(dh.DoanhThuHanhLy,    0) AS DoanhThuHanhLy,
        ISNULL(dv.SoVeBan,           0) AS SoVeBan,
        CASE
            WHEN tt.TongTong > 0
            THEN ROUND(
                    100.0
                    * (ISNULL(dv.DoanhThuVe, 0) + ISNULL(dh.DoanhThuHanhLy, 0))
                    / tt.TongTong,
                    2
                )
            ELSE 0
        END AS PhanTramTrenTong
    FROM dbo.CHUYENBAY cb
    LEFT JOIN DoanhThuVe     dv ON cb.MaChuyenBay = dv.MaChuyenBay
    LEFT JOIN DoanhThuHanhLy dh ON cb.MaChuyenBay = dh.MaChuyenBay
    CROSS JOIN TongThang     tt
    WHERE YEAR(cb.NgayGioBay)  = @Nam
      AND MONTH(cb.NgayGioBay) = @Thang
      AND cb.IsDeleted         = 0
    ORDER BY cb.NgayGioBay;
END;
GO
