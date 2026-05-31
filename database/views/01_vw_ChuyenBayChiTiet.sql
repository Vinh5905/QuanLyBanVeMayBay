USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Joins CHUYENBAY + SANBAY (departure, destination) + seat stats per class.
-- H1 = cheapest class (lowest HeSoGia), H2 = next class.
-- Only includes non-deleted flights.
CREATE OR ALTER VIEW dbo.vw_ChuyenBayChiTiet
AS
WITH RankedClasses AS (
    SELECT
        cthv.MaChuyenBay,
        cthv.SoLuong,
        cthv.SoGheDaDat,
        cthv.SoLuong - cthv.SoGheDaDat AS SoCon,
        ROW_NUMBER() OVER (
            PARTITION BY cthv.MaChuyenBay
            ORDER BY hv.HeSoGia ASC, hv.MaHangVe ASC
        ) AS rn
    FROM dbo.CT_HANGVE cthv
    INNER JOIN dbo.HANGVE hv ON cthv.MaHangVe = hv.MaHangVe
)
SELECT
    cb.MaChuyenBay,
    cb.MaChuyenBayCode,
    sb_di.MaSanBay                                       AS SanBayDiCode,
    sb_di.TenSanBay                                      AS SanBayDiTen,
    sb_den.MaSanBay                                      AS SanBayDenCode,
    sb_den.TenSanBay                                     AS SanBayDenTen,
    cb.NgayGioBay,
    cb.ThoiGianBay,
    cb.GiaCoBan,
    MAX(CASE WHEN rc.rn = 1 THEN rc.SoLuong    END)     AS TongGheH1,
    MAX(CASE WHEN rc.rn = 1 THEN rc.SoGheDaDat END)     AS GheDaBanH1,
    MAX(CASE WHEN rc.rn = 1 THEN rc.SoCon      END)     AS GheConH1,
    MAX(CASE WHEN rc.rn = 2 THEN rc.SoLuong    END)     AS TongGheH2,
    MAX(CASE WHEN rc.rn = 2 THEN rc.SoGheDaDat END)     AS GheDaBanH2,
    MAX(CASE WHEN rc.rn = 2 THEN rc.SoCon      END)     AS GheConH2,
    cb.TrangThaiChuyenBay                                AS TrangThai
FROM dbo.CHUYENBAY cb
INNER JOIN dbo.SANBAY sb_di  ON cb.SanBayDi  = sb_di.MaSanBay
INNER JOIN dbo.SANBAY sb_den ON cb.SanBayDen = sb_den.MaSanBay
LEFT  JOIN RankedClasses rc  ON rc.MaChuyenBay = cb.MaChuyenBay
WHERE cb.IsDeleted = 0
GROUP BY
    cb.MaChuyenBay, cb.MaChuyenBayCode,
    sb_di.MaSanBay, sb_di.TenSanBay,
    sb_den.MaSanBay, sb_den.TenSanBay,
    cb.NgayGioBay, cb.ThoiGianBay, cb.GiaCoBan,
    cb.TrangThaiChuyenBay;
GO
