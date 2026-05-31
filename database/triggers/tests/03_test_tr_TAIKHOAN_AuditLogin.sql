USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: tr_TAIKHOAN_AuditLogin ===';
GO

-- Test 1: UPDATE LastLogin → AUDIT_LOG entry with TenHanhDong='USER_LOGIN' is created
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_AL_T1');
DECLARE @MaKH1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.VAITRO (TenVaiTro) VALUES ('ROLE_AL1_' + CAST(@@SPID AS VARCHAR));
DECLARE @MaVT1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, MaKhachHang)
VALUES ('al1_user_' + CAST(@@SPID AS VARCHAR), 'hash', @MaVT1, @MaKH1);
DECLARE @MaTK1 INT = SCOPE_IDENTITY();

DECLARE @AuditBefore INT;
SELECT @AuditBefore = COUNT(*) FROM dbo.AUDIT_LOG
WHERE MaTaiKhoan = @MaTK1 AND TenHanhDong = 'USER_LOGIN';

-- Simulate login: update LastLogin
UPDATE dbo.TAIKHOAN
SET LastLogin = SYSUTCDATETIME()
WHERE MaTaiKhoan = @MaTK1;

DECLARE @AuditAfter INT;
SELECT @AuditAfter = COUNT(*) FROM dbo.AUDIT_LOG
WHERE MaTaiKhoan = @MaTK1 AND TenHanhDong = 'USER_LOGIN';

IF @AuditAfter <> @AuditBefore + 1
    RAISERROR(N'FAIL [tr_TAIKHOAN_AuditLogin] Expected 1 new AUDIT_LOG entry for USER_LOGIN', 16, 1);

-- Verify the audit record content
IF NOT EXISTS (
    SELECT 1 FROM dbo.AUDIT_LOG
    WHERE MaTaiKhoan = @MaTK1
      AND TenHanhDong = 'USER_LOGIN'
      AND TenBang = 'TAIKHOAN'
      AND MaBanGhi = CAST(@MaTK1 AS VARCHAR(50))
)
    RAISERROR(N'FAIL [tr_TAIKHOAN_AuditLogin] AUDIT_LOG entry has wrong content', 16, 1);

PRINT N'PASS [tr_TAIKHOAN_AuditLogin] LastLogin update creates USER_LOGIN audit entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: UPDATE a column other than LastLogin → no AUDIT_LOG entry added
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_AL_T2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.VAITRO (TenVaiTro) VALUES ('ROLE_AL2_' + CAST(@@SPID AS VARCHAR));
DECLARE @MaVT2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, MaKhachHang)
VALUES ('al2_user_' + CAST(@@SPID AS VARCHAR), 'hash', @MaVT2, @MaKH2);
DECLARE @MaTK2 INT = SCOPE_IDENTITY();

DECLARE @AuditBefore2 INT;
SELECT @AuditBefore2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE MaTaiKhoan = @MaTK2 AND TenHanhDong = 'USER_LOGIN';

-- Update Email only (no LastLogin change)
UPDATE dbo.TAIKHOAN SET Email = 'no_login@example.com' WHERE MaTaiKhoan = @MaTK2;

DECLARE @AuditAfter2 INT;
SELECT @AuditAfter2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE MaTaiKhoan = @MaTK2 AND TenHanhDong = 'USER_LOGIN';

IF @AuditAfter2 <> @AuditBefore2
    RAISERROR(N'FAIL [tr_TAIKHOAN_AuditLogin] Non-LastLogin update should not create audit entry', 16, 1);

PRINT N'PASS [tr_TAIKHOAN_AuditLogin] Non-LastLogin update creates no USER_LOGIN entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== tr_TAIKHOAN_AuditLogin: all tests passed ===';
GO
