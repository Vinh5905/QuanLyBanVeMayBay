USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'Verifying functions...';
GO

IF OBJECT_ID(N'dbo.fn_TinhGiaVe', N'FN') IS NULL
    RAISERROR(N'MISSING: dbo.fn_TinhGiaVe', 16, 1);
IF OBJECT_ID(N'dbo.fn_TinhPhiHangLy', N'FN') IS NULL
    RAISERROR(N'MISSING: dbo.fn_TinhPhiHangLy', 16, 1);
IF OBJECT_ID(N'dbo.fn_KiemTraCuaSoCheckIn', N'FN') IS NULL
    RAISERROR(N'MISSING: dbo.fn_KiemTraCuaSoCheckIn', 16, 1);
IF OBJECT_ID(N'dbo.fn_LayThamSo', N'FN') IS NULL
    RAISERROR(N'MISSING: dbo.fn_LayThamSo', 16, 1);
GO

PRINT N'All 4 functions verified OK.';
GO
