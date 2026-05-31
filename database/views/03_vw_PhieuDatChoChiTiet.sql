USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Joins PHIEUDATCHO + KHACHHANG + CHUYENBAY + HANGVE + SANBAY.
-- PhutsConLai is negative when HanThanhToan has already passed.
CREATE OR ALTER VIEW dbo.vw_PhieuDatChoChiTiet
AS
SELECT
    pdc.MaPhieuDatCho,
    kh.HoTen                                              AS HoTenKhach,
    kh.CCCD,
    cb.MaChuyenBayCode                                    AS TenChuyenBay,
    sb_di.MaSanBay + N' → ' + sb_den.MaSanBay            AS TuyenBay,
    cb.NgayGioBay,
    hv.TenHangVe,
    pdc.SoLuongVe,
    pdc.TongTien,
    pdc.TrangThaiDatCho,
    pdc.HanThanhToan,
    DATEDIFF(MINUTE, SYSUTCDATETIME(), pdc.HanThanhToan)  AS PhutsConLai,
    pdc.CreatedAt
FROM dbo.PHIEUDATCHO pdc
INNER JOIN dbo.KHACHHANG kh   ON pdc.MaKhachHang = kh.MaKhachHang
INNER JOIN dbo.CHUYENBAY cb   ON pdc.MaChuyenBay = cb.MaChuyenBay
INNER JOIN dbo.HANGVE    hv   ON pdc.MaHangVe    = hv.MaHangVe
INNER JOIN dbo.SANBAY sb_di   ON cb.SanBayDi     = sb_di.MaSanBay
INNER JOIN dbo.SANBAY sb_den  ON cb.SanBayDen    = sb_den.MaSanBay;
GO
