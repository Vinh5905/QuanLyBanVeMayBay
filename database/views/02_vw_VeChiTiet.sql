USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Joins VE + KHACHHANG + CHUYENBAY + HANGVE + SANBAY.
-- Excludes soft-deleted tickets (IsDeleted = 1).
CREATE OR ALTER VIEW dbo.vw_VeChiTiet
AS
SELECT
    v.MaVe,
    v.MaVeCode,
    kh.HoTen                                             AS HoTenKhach,
    kh.CCCD,
    cb.MaChuyenBayCode                                   AS TenChuyenBay,
    sb_di.MaSanBay + N' → ' + sb_den.MaSanBay           AS TuyenBay,
    cb.NgayGioBay,
    hv.TenHangVe,
    v.GiaVe,
    v.TrangThaiVe,
    v.CreatedAt                                          AS NgayGiaoDich
FROM dbo.VE v
INNER JOIN dbo.KHACHHANG kh   ON v.MaKhachHang  = kh.MaKhachHang
INNER JOIN dbo.CHUYENBAY cb   ON v.MaChuyenBay  = cb.MaChuyenBay
INNER JOIN dbo.HANGVE    hv   ON v.MaHangVe     = hv.MaHangVe
INNER JOIN dbo.SANBAY sb_di   ON cb.SanBayDi    = sb_di.MaSanBay
INNER JOIN dbo.SANBAY sb_den  ON cb.SanBayDen   = sb_den.MaSanBay
WHERE v.IsDeleted = 0;
GO
