USE [$(DB_NAME)];
GO

PRINT N'Verifying views...';

DECLARE @Errors INT = 0;

IF OBJECT_ID(N'dbo.vw_ChuyenBayChiTiet',      N'V') IS NULL BEGIN PRINT N'MISSING: vw_ChuyenBayChiTiet';      SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_VeChiTiet',             N'V') IS NULL BEGIN PRINT N'MISSING: vw_VeChiTiet';             SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_PhieuDatChoChiTiet',    N'V') IS NULL BEGIN PRINT N'MISSING: vw_PhieuDatChoChiTiet';    SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_DashboardSummary',      N'V') IS NULL BEGIN PRINT N'MISSING: vw_DashboardSummary';      SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_DoanhThuTheoChuyenBay', N'V') IS NULL BEGIN PRINT N'MISSING: vw_DoanhThuTheoChuyenBay'; SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_AuditLogChiTiet',       N'V') IS NULL BEGIN PRINT N'MISSING: vw_AuditLogChiTiet';       SET @Errors += 1; END;
IF OBJECT_ID(N'dbo.vw_HanhLyTheoVe',          N'V') IS NULL BEGIN PRINT N'MISSING: vw_HanhLyTheoVe';          SET @Errors += 1; END;

IF @Errors > 0
    RAISERROR(N'View verification failed: %d view(s) missing', 16, 1, @Errors);
ELSE
    PRINT N'All 7 views verified OK';
GO
