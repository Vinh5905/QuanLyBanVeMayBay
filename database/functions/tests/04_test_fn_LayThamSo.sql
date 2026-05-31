USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: fn_LayThamSo ===';
GO

-- Test 1: Existing key returns correct value
DECLARE @Val1 NVARCHAR(500) = dbo.fn_LayThamSo('ThueVAT');
IF @Val1 <> N'10'
    RAISERROR(N'FAIL [fn_LayThamSo] ThueVAT should return "10"', 16, 1);
PRINT N'PASS [fn_LayThamSo] Existing key returns correct value';
GO

-- Test 2: Another existing key (cross-check)
DECLARE @Val2 NVARCHAR(500) = dbo.fn_LayThamSo('ThoiGianMuaHanhLyUuDai');
IF @Val2 <> N'3'
    RAISERROR(N'FAIL [fn_LayThamSo] ThoiGianMuaHanhLyUuDai should return "3"', 16, 1);
PRINT N'PASS [fn_LayThamSo] ThoiGianMuaHanhLyUuDai returns "3"';
GO

-- Test 3: Non-existent key returns NULL
DECLARE @Val3 NVARCHAR(500) = dbo.fn_LayThamSo('NO_SUCH_KEY_XYZ_99999');
IF @Val3 IS NOT NULL
    RAISERROR(N'FAIL [fn_LayThamSo] Non-existent key should return NULL', 16, 1);
PRINT N'PASS [fn_LayThamSo] Non-existent key returns NULL';
GO

-- Test 4: NULL input returns NULL (RETURNS NULL ON NULL INPUT)
DECLARE @Val4 NVARCHAR(500) = dbo.fn_LayThamSo(NULL);
IF @Val4 IS NOT NULL
    RAISERROR(N'FAIL [fn_LayThamSo] NULL input should return NULL', 16, 1);
PRINT N'PASS [fn_LayThamSo] NULL input returns NULL';
GO

PRINT N'=== fn_LayThamSo: all tests passed ===';
GO
