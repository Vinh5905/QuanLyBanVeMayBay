USE [$(DB_NAME)];
GO

PRINT N'=== TEST: sp_AuditLog_Insert ===';
GO

-- Test 1: Happy path — inserts a log entry and returns a new Id
BEGIN TRAN;

DECLARE @NewId BIGINT;
EXEC dbo.sp_AuditLog_Insert
    @MaTaiKhoan  = NULL,
    @TenHanhDong = 'TEST_ACTION',
    @TenBang     = 'VE',
    @MaBanGhi    = '1',
    @DuLieuCu   = N'{"old":"value"}',
    @DuLieuMoi  = N'{"new":"value"}',
    @IpAddress   = '127.0.0.1',
    @NewId       = @NewId OUTPUT;

IF @NewId IS NULL OR @NewId <= 0
    RAISERROR(N'FAIL [sp_AuditLog_Insert] Happy path: NewId should be > 0', 16, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.AUDIT_LOG WHERE Id = @NewId AND TenHanhDong = 'TEST_ACTION')
    RAISERROR(N'FAIL [sp_AuditLog_Insert] Happy path: record not found in AUDIT_LOG', 16, 1);

PRINT N'PASS [sp_AuditLog_Insert] Happy path';

ROLLBACK;
GO

-- Test 2: Null account (anonymous action) is allowed
BEGIN TRAN;

DECLARE @NewId2 BIGINT;
EXEC dbo.sp_AuditLog_Insert
    @MaTaiKhoan  = NULL,
    @TenHanhDong = 'ANON_ACTION',
    @NewId       = @NewId2 OUTPUT;

IF @NewId2 IS NULL
    RAISERROR(N'FAIL [sp_AuditLog_Insert] Null MaTaiKhoan: should succeed', 16, 1);

PRINT N'PASS [sp_AuditLog_Insert] Null MaTaiKhoan';

ROLLBACK;
GO

PRINT N'=== sp_AuditLog_Insert: all tests passed ===';
GO
