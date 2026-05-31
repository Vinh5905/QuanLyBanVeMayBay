USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: fn_TinhGiaVe ===';
GO

-- Test 1: 500000 * 1.5 = 750000
BEGIN TRAN;

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'FnGia_HV1_' + CAST(@@SPID AS NVARCHAR), 1.5);
DECLARE @MaHV1 INT = SCOPE_IDENTITY();

DECLARE @Result1 DECIMAL(18,2) = dbo.fn_TinhGiaVe(500000, @MaHV1);
IF @Result1 <> 750000
    RAISERROR(N'FAIL [fn_TinhGiaVe] 500000 * 1.5 should be 750000', 16, 1);

PRINT N'PASS [fn_TinhGiaVe] 500000 * 1.5 = 750000';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Identity multiplier (HeSoGia = 1.0)
BEGIN TRAN;

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'FnGia_HV2_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @Result2 DECIMAL(18,2) = dbo.fn_TinhGiaVe(500000, @MaHV2);
IF @Result2 <> 500000
    RAISERROR(N'FAIL [fn_TinhGiaVe] Identity multiplier: expected 500000', 16, 1);

PRINT N'PASS [fn_TinhGiaVe] Identity multiplier (HeSoGia=1.0)';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: Non-existent MaHangVe returns NULL
DECLARE @Result3 DECIMAL(18,2) = dbo.fn_TinhGiaVe(500000, -999);
IF @Result3 IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhGiaVe] Non-existent MaHangVe should return NULL', 16, 1);
PRINT N'PASS [fn_TinhGiaVe] Non-existent MaHangVe returns NULL';
GO

-- Test 4: NULL input returns NULL (RETURNS NULL ON NULL INPUT)
DECLARE @Result4 DECIMAL(18,2) = dbo.fn_TinhGiaVe(NULL, 1);
IF @Result4 IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhGiaVe] NULL GiaCoBan should return NULL', 16, 1);
PRINT N'PASS [fn_TinhGiaVe] NULL input returns NULL';
GO

PRINT N'=== fn_TinhGiaVe: all tests passed ===';
GO
