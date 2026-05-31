USE [$(DB_NAME)];
GO

-- Annual revenue report: 12-row result set (one row per month) with totals and %.
-- Months with no flights still appear (0 values) via the Numbers CTE.
CREATE OR ALTER PROCEDURE dbo.sp_Report_DoanhThuNam
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH
    -- Generate months 1-12 so every month appears even with no data
    Months AS (
        SELECT m FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS t(m)
    ),
    DoanhThuVeThang AS (
        SELECT
            MONTH(cb.NgayGioBay)   AS Thang,
            SUM(t.SoTien)          AS DoanhThuVe,
            COUNT(DISTINCT v.MaVe) AS SoVeBan,
            COUNT(DISTINCT cb.MaChuyenBay) AS SoChuyenBay
        FROM dbo.CHUYENBAY cb
        INNER JOIN dbo.VE v
            ON cb.MaChuyenBay = v.MaChuyenBay
           AND v.IsDeleted    = 0
           AND v.TrangThaiVe  = 'HOP_LE'
        INNER JOIN dbo.THANHTOAN t
            ON v.MaVe = t.MaVe AND t.TrangThaiThanhToan = 'COMPLETED'
        WHERE YEAR(cb.NgayGioBay) = @Nam AND cb.IsDeleted = 0
        GROUP BY MONTH(cb.NgayGioBay)
    ),
    DoanhThuHanhLyThang AS (
        SELECT
            MONTH(cb.NgayGioBay) AS Thang,
            SUM(gh.TongPhi)      AS DoanhThuHanhLy
        FROM dbo.CHUYENBAY cb
        INNER JOIN dbo.VE v
            ON cb.MaChuyenBay = v.MaChuyenBay AND v.IsDeleted = 0
        INNER JOIN dbo.GOIHANHLY gh ON v.MaVe = gh.MaVe
        WHERE YEAR(cb.NgayGioBay) = @Nam AND cb.IsDeleted = 0
        GROUP BY MONTH(cb.NgayGioBay)
    ),
    TongNam AS (
        SELECT
            SUM(ISNULL(dv.DoanhThuVe, 0) + ISNULL(dh.DoanhThuHanhLy, 0)) AS TongTong
        FROM Months m
        LEFT JOIN DoanhThuVeThang     dv ON dv.Thang = m.m
        LEFT JOIN DoanhThuHanhLyThang dh ON dh.Thang = m.m
    )
    SELECT
        m.m AS Thang,
        ISNULL(dv.SoChuyenBay, 0)  AS SoChuyenBay,
        ISNULL(dv.SoVeBan,     0)  AS SoVe,
        ISNULL(dv.DoanhThuVe,  0)
        + ISNULL(dh.DoanhThuHanhLy, 0) AS DoanhThu,
        CASE
            WHEN tn.TongTong > 0
            THEN ROUND(
                    100.0
                    * (ISNULL(dv.DoanhThuVe, 0) + ISNULL(dh.DoanhThuHanhLy, 0))
                    / tn.TongTong,
                    2
                )
            ELSE 0
        END AS PhanTram
    FROM Months m
    LEFT JOIN DoanhThuVeThang     dv ON dv.Thang = m.m
    LEFT JOIN DoanhThuHanhLyThang dh ON dh.Thang = m.m
    CROSS JOIN TongNam tn
    ORDER BY m.m;
END;
GO
