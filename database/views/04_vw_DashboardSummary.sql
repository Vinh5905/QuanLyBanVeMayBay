USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Single-row dashboard aggregate for the API layer (SELECT * FROM vw_DashboardSummary).
-- Dates are compared against SYSUTCDATETIME() (UTC), consistent with the rest of the system.
-- TongVeHomNay    : tickets with TrangThaiVe='HOP_LE' created today (UTC)
-- DoanhThuHomNay  : sum of THANHTOAN COMPLETED today (SoTien + ThueVAT)
-- SoChuyenBayHomNay : non-deleted flights departing today (UTC)
-- SoKhachMoiThangNay: non-deleted customers created this calendar month (UTC)
CREATE OR ALTER VIEW dbo.vw_DashboardSummary
AS
SELECT
    (
        SELECT COUNT(*)
        FROM dbo.VE
        WHERE IsDeleted = 0
          AND TrangThaiVe = 'HOP_LE'
          AND CAST(CreatedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE)
    )                                                        AS TongVeHomNay,

    (
        SELECT ISNULL(SUM(SoTien + ThueVAT), 0)
        FROM dbo.THANHTOAN
        WHERE TrangThaiThanhToan = 'COMPLETED'
          AND ThoiGianThanhToan IS NOT NULL
          AND CAST(ThoiGianThanhToan AS DATE) = CAST(SYSUTCDATETIME() AS DATE)
    )                                                        AS DoanhThuHomNay,

    (
        SELECT COUNT(*)
        FROM dbo.CHUYENBAY
        WHERE IsDeleted = 0
          AND CAST(NgayGioBay AS DATE) = CAST(SYSUTCDATETIME() AS DATE)
    )                                                        AS SoChuyenBayHomNay,

    (
        SELECT COUNT(*)
        FROM dbo.KHACHHANG
        WHERE IsDeleted = 0
          AND YEAR(CreatedAt)  = YEAR(SYSUTCDATETIME())
          AND MONTH(CreatedAt) = MONTH(SYSUTCDATETIME())
    )                                                        AS SoKhachMoiThangNay;
GO
