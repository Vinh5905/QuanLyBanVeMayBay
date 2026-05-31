USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: fn_KiemTraCuaSoCheckIn ===';
GO

-- Config from helpers: THOI_GIAN_MO_CHECKIN=24h, THOI_GIAN_DONG_CHECKIN=60min
-- Flight departs in 12h → window opens at now-12h, closes at now+11h

-- Test 1: Too early — 13h before departure, window opens at 12h before
DECLARE @NgayBay1 DATETIME2(0) = DATEADD(HOUR, 12, SYSUTCDATETIME());
DECLARE @TooEarly DATETIME2(0) = DATEADD(HOUR, -13, SYSUTCDATETIME());
DECLARE @r1 BIT = dbo.fn_KiemTraCuaSoCheckIn(@NgayBay1, @TooEarly);
IF @r1 <> 0
    RAISERROR(N'FAIL [fn_KiemTraCuaSoCheckIn] Too early should return 0', 16, 1);
PRINT N'PASS [fn_KiemTraCuaSoCheckIn] Too early returns 0';
GO

-- Test 2: Within window — check-in at current time (now), flight in 12h
DECLARE @NgayBay2 DATETIME2(0) = DATEADD(HOUR, 12, SYSUTCDATETIME());
DECLARE @InWindow DATETIME2(0) = SYSUTCDATETIME();
DECLARE @r2 BIT = dbo.fn_KiemTraCuaSoCheckIn(@NgayBay2, @InWindow);
IF @r2 <> 1
    RAISERROR(N'FAIL [fn_KiemTraCuaSoCheckIn] In-window check-in should return 1', 16, 1);
PRINT N'PASS [fn_KiemTraCuaSoCheckIn] In-window check-in returns 1';
GO

-- Test 3: Too late — check-in at 25 min before departure (window closes at 60 min before)
DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 12, SYSUTCDATETIME());
DECLARE @TooLate DATETIME2(0) = DATEADD(MINUTE, -25, @NgayBay3);
DECLARE @r3 BIT = dbo.fn_KiemTraCuaSoCheckIn(@NgayBay3, @TooLate);
IF @r3 <> 0
    RAISERROR(N'FAIL [fn_KiemTraCuaSoCheckIn] Too late should return 0', 16, 1);
PRINT N'PASS [fn_KiemTraCuaSoCheckIn] Too late returns 0';
GO

-- Test 4: NULL input returns NULL (RETURNS NULL ON NULL INPUT)
DECLARE @r4 BIT = dbo.fn_KiemTraCuaSoCheckIn(NULL, SYSUTCDATETIME());
IF @r4 IS NOT NULL
    RAISERROR(N'FAIL [fn_KiemTraCuaSoCheckIn] NULL input should return NULL', 16, 1);
PRINT N'PASS [fn_KiemTraCuaSoCheckIn] NULL input returns NULL';
GO

PRINT N'=== fn_KiemTraCuaSoCheckIn: all tests passed ===';
GO
