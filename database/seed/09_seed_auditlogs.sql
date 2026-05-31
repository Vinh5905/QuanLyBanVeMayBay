USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Audit Logs (AUDIT_LOG) ===';
GO

IF (SELECT COUNT(*) FROM dbo.AUDIT_LOG WHERE MaBanGhi LIKE 'SEED-%') = 0
BEGIN
    DECLARE @TK_Admin INT = (SELECT MaTaiKhoan FROM dbo.TAIKHOAN WHERE TenDangNhap = 'admin');
    DECLARE @TK_Staff INT = (SELECT MaTaiKhoan FROM dbo.TAIKHOAN WHERE TenDangNhap = 'staff');
    DECLARE @TK_User1 INT = (SELECT MaTaiKhoan FROM dbo.TAIKHOAN WHERE TenDangNhap = 'user1');

    INSERT INTO dbo.AUDIT_LOG (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, DuLieuCu, DuLieuMoi, IpAddress, ThoiGian)
    VALUES
    -- Admin login
    (@TK_Admin, 'LOGIN', 'TAIKHOAN', 'SEED-TK-admin',
     NULL, NULL, '192.168.1.100', DATEADD(HOUR, -72, SYSUTCDATETIME())),

    -- Admin updated a config value
    (@TK_Admin, 'UPDATE_CONFIG', 'APP_CONFIG', 'SEED-CFG-THUE_VAT',
     N'{"ConfigKey":"THUE_VAT","ConfigValue":"8"}',
     N'{"ConfigKey":"THUE_VAT","ConfigValue":"10"}',
     '192.168.1.100', DATEADD(HOUR, -71, SYSUTCDATETIME())),

    -- Staff login
    (@TK_Staff, 'LOGIN', 'TAIKHOAN', 'SEED-TK-staff',
     NULL, NULL, '192.168.1.101', DATEADD(HOUR, -48, SYSUTCDATETIME())),

    -- Staff sold a ticket (VE-001)
    (@TK_Staff, 'BAN_VE', 'VE', 'SEED-VE-001',
     NULL,
     N'{"MaVeCode":"SEED-VE-001","TrangThaiVe":"HOP_LE","GiaVe":1200000}',
     '192.168.1.101', DATEADD(HOUR, -47, SYSUTCDATETIME())),

    -- User1 login
    (@TK_User1, 'LOGIN', 'TAIKHOAN', 'SEED-TK-user1',
     NULL, NULL, '203.113.155.42', DATEADD(HOUR, -24, SYSUTCDATETIME())),

    -- User1 booked a reservation
    (@TK_User1, 'DAT_VE', 'PHIEUDATCHO', 'SEED-PDC-user1',
     NULL,
     N'{"TrangThaiDatCho":"DANG_GIU_CHO","TongTien":650000}',
     '203.113.155.42', DATEADD(HOUR, -23, SYSUTCDATETIME()));
END;
GO

PRINT N'=== Audit logs seed completed ===';
GO
