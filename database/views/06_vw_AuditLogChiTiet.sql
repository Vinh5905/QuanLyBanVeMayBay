USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Joins AUDIT_LOG + TAIKHOAN for readable action history.
-- LEFT JOIN so system-generated entries without a MaTaiKhoan are still included.
CREATE OR ALTER VIEW dbo.vw_AuditLogChiTiet
AS
SELECT
    al.Id,
    al.MaTaiKhoan,
    tk.TenDangNhap,
    al.TenHanhDong,
    al.TenBang,
    al.MaBanGhi,
    al.IpAddress,
    al.ThoiGian
FROM dbo.AUDIT_LOG al
LEFT JOIN dbo.TAIKHOAN tk ON tk.MaTaiKhoan = al.MaTaiKhoan;
GO
