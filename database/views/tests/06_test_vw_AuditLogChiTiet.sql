USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_AuditLogChiTiet ===';
GO

-- Test 1: Audit log entry with a linked account shows TenDangNhap
BEGIN TRAN;

INSERT INTO dbo.VAITRO (TenVaiTro) VALUES ('ROLE_AUD_' + CAST(@@SPID AS VARCHAR));
DECLARE @MaVT INT = SCOPE_IDENTITY();

INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro)
VALUES ('aud_user_' + CAST(@@SPID AS VARCHAR), 'hash', @MaVT);
DECLARE @MaTK INT = SCOPE_IDENTITY();

INSERT INTO dbo.AUDIT_LOG (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, ThoiGian)
VALUES (@MaTK, 'USER_LOGIN', 'TAIKHOAN', CAST(@MaTK AS VARCHAR(50)), SYSUTCDATETIME());
DECLARE @MaLog INT = CAST(SCOPE_IDENTITY() AS INT);

DECLARE @TenDN VARCHAR(50), @HanhDong VARCHAR(100);
SELECT
    @TenDN    = TenDangNhap,
    @HanhDong = TenHanhDong
FROM dbo.vw_AuditLogChiTiet
WHERE Id = @MaLog;

IF @TenDN <> 'aud_user_' + CAST(@@SPID AS VARCHAR)
    RAISERROR(N'FAIL [vw_AuditLogChiTiet] TenDangNhap incorrect', 16, 1);
IF @HanhDong <> 'USER_LOGIN'
    RAISERROR(N'FAIL [vw_AuditLogChiTiet] TenHanhDong incorrect', 16, 1);

PRINT N'PASS [vw_AuditLogChiTiet] Entry with linked account shows TenDangNhap';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Audit log entry without a MaTaiKhoan (system action) still appears
BEGIN TRAN;

INSERT INTO dbo.AUDIT_LOG (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, ThoiGian)
VALUES (NULL, 'SYSTEM_ACTION', 'APP_CONFIG', 'config_key', SYSUTCDATETIME());
DECLARE @MaLogSys INT = CAST(SCOPE_IDENTITY() AS INT);

DECLARE @TenDNSys VARCHAR(50);
SELECT @TenDNSys = TenDangNhap FROM dbo.vw_AuditLogChiTiet WHERE Id = @MaLogSys;

IF @TenDNSys IS NOT NULL
    RAISERROR(N'FAIL [vw_AuditLogChiTiet] System entry TenDangNhap should be NULL', 16, 1);

PRINT N'PASS [vw_AuditLogChiTiet] System entry (no account) appears with NULL TenDangNhap';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_AuditLogChiTiet: all tests passed ===';
GO
