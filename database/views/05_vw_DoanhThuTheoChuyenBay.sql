USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Revenue summary per non-deleted flight.
-- Counts only HOP_LE tickets; baggage revenue from GOIHANHLY linked to those tickets.
-- CTEs avoid double-counting when a ticket has multiple baggage packages.
CREATE OR ALTER VIEW dbo.vw_DoanhThuTheoChuyenBay
AS
WITH VeStats AS (
    SELECT
        MaChuyenBay,
        COUNT(MaVe)   AS SoVeBan,
        SUM(GiaVe)    AS DoanhThuVe
    FROM dbo.VE
    WHERE IsDeleted = 0
      AND TrangThaiVe = 'HOP_LE'
    GROUP BY MaChuyenBay
),
HanhLyStats AS (
    SELECT
        v.MaChuyenBay,
        SUM(g.TongPhi) AS DoanhThuHanhLy
    FROM dbo.GOIHANHLY g
    INNER JOIN dbo.VE v ON v.MaVe = g.MaVe
    WHERE v.IsDeleted = 0
      AND v.TrangThaiVe = 'HOP_LE'
    GROUP BY v.MaChuyenBay
)
SELECT
    cb.MaChuyenBay,
    cb.MaChuyenBayCode,
    sb_di.MaSanBay + N' → ' + sb_den.MaSanBay            AS TuyenBay,
    cb.NgayGioBay,
    ISNULL(vs.SoVeBan, 0)                                 AS SoVeBan,
    ISNULL(vs.DoanhThuVe, 0)                              AS DoanhThuVe,
    ISNULL(hl.DoanhThuHanhLy, 0)                          AS DoanhThuHanhLy,
    ISNULL(vs.DoanhThuVe, 0) + ISNULL(hl.DoanhThuHanhLy, 0) AS TongDoanhThu
FROM dbo.CHUYENBAY cb
INNER JOIN dbo.SANBAY sb_di  ON cb.SanBayDi  = sb_di.MaSanBay
INNER JOIN dbo.SANBAY sb_den ON cb.SanBayDen = sb_den.MaSanBay
LEFT  JOIN VeStats    vs     ON vs.MaChuyenBay = cb.MaChuyenBay
LEFT  JOIN HanhLyStats hl    ON hl.MaChuyenBay = cb.MaChuyenBay
WHERE cb.IsDeleted = 0;
GO
