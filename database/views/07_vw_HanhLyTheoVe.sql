USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Baggage summary per non-deleted ticket.
-- SoKien: total piece count across all GOIHANHLY packages for the ticket.
-- TongKg / TongTienHanhLy: summed from GOIHANHLY (one row per package per ticket).
-- Two-level aggregation (per package then per ticket) avoids row inflation.
CREATE OR ALTER VIEW dbo.vw_HanhLyTheoVe
AS
WITH GoiAgg AS (
    SELECT
        g.MaVe,
        g.MaGoiHanhLy,
        COUNT(k.MaKienHanhLy)  AS SoKien_goi
    FROM dbo.GOIHANHLY g
    LEFT JOIN dbo.KIENHANHLY k ON k.MaGoiHanhLy = g.MaGoiHanhLy
    GROUP BY g.MaVe, g.MaGoiHanhLy
),
VeHanhLy AS (
    SELECT
        ga.MaVe,
        SUM(ga.SoKien_goi)     AS SoKien,
        SUM(g.TongTrongLuong)  AS TongKg,
        SUM(g.TongPhi)         AS TongTienHanhLy
    FROM GoiAgg ga
    INNER JOIN dbo.GOIHANHLY g ON g.MaGoiHanhLy = ga.MaGoiHanhLy
    GROUP BY ga.MaVe
)
SELECT
    v.MaVe,
    v.MaVeCode,
    kh.HoTen                                   AS HoTenKhach,
    cb.MaChuyenBayCode                         AS TenChuyenBay,
    ISNULL(vh.SoKien, 0)                       AS SoKien,
    ISNULL(vh.TongKg, 0)                       AS TongKg,
    ISNULL(vh.TongTienHanhLy, 0)               AS TongTienHanhLy
FROM dbo.VE v
INNER JOIN dbo.KHACHHANG kh ON v.MaKhachHang = kh.MaKhachHang
INNER JOIN dbo.CHUYENBAY cb ON v.MaChuyenBay = cb.MaChuyenBay
LEFT  JOIN VeHanhLy      vh ON vh.MaVe       = v.MaVe
WHERE v.IsDeleted = 0;
GO
