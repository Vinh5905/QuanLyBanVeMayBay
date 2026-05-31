USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Automatically sets UpdatedAt = SYSUTCDATETIME() whenever a row is updated
-- without the caller explicitly setting UpdatedAt. Applied to all 5 tables
-- that have an UpdatedAt column: TAIKHOAN, KHACHHANG, CHUYENBAY, VE, PHIEUDATCHO.
-- Uses IF NOT UPDATE(UpdatedAt) so callers can still override the timestamp.

CREATE OR ALTER TRIGGER dbo.tr_TAIKHOAN_AutoUpdateTimestamp
ON dbo.TAIKHOAN
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE t SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.TAIKHOAN t
        INNER JOIN inserted i ON t.MaTaiKhoan = i.MaTaiKhoan;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.tr_KHACHHANG_AutoUpdateTimestamp
ON dbo.KHACHHANG
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE t SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.KHACHHANG t
        INNER JOIN inserted i ON t.MaKhachHang = i.MaKhachHang;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.tr_CHUYENBAY_AutoUpdateTimestamp
ON dbo.CHUYENBAY
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE t SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.CHUYENBAY t
        INNER JOIN inserted i ON t.MaChuyenBay = i.MaChuyenBay;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.tr_VE_AutoUpdateTimestamp
ON dbo.VE
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE t SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.VE t
        INNER JOIN inserted i ON t.MaVe = i.MaVe;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.tr_PHIEUDATCHO_AutoUpdateTimestamp
ON dbo.PHIEUDATCHO
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE t SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.PHIEUDATCHO t
        INNER JOIN inserted i ON t.MaPhieuDatCho = i.MaPhieuDatCho;
    END;
END;
GO
