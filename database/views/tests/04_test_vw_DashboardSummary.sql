USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_DashboardSummary ===';
GO

-- Test 1: New HOP_LE ticket today increments TongVeHomNay
BEGIN TRAN;

DECLARE @VeBefore INT;
SELECT @VeBefore = TongVeHomNay FROM dbo.vw_DashboardSummary;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DS1', N'DS1 Airport', N'City A', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DS2', N'DS2 Airport', N'City B', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DS Test');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'DS_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(DAY, 3, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DS01_' + CAST(@@SPID AS VARCHAR), 'DS1', 'DS2', @NgayBay, 90, 400000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('VE_DS_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 400000, 'HOP_LE');

DECLARE @VeAfter INT;
SELECT @VeAfter = TongVeHomNay FROM dbo.vw_DashboardSummary;

IF @VeAfter <> @VeBefore + 1
    RAISERROR(N'FAIL [vw_DashboardSummary] TongVeHomNay did not increment by 1', 16, 1);

PRINT N'PASS [vw_DashboardSummary] TongVeHomNay increments for new HOP_LE ticket';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: New customer this month increments SoKhachMoiThangNay
BEGIN TRAN;

DECLARE @KhachBefore INT;
SELECT @KhachBefore = SoKhachMoiThangNay FROM dbo.vw_DashboardSummary;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH MoiThang_' + CAST(@@SPID AS NVARCHAR));

DECLARE @KhachAfter INT;
SELECT @KhachAfter = SoKhachMoiThangNay FROM dbo.vw_DashboardSummary;

IF @KhachAfter <> @KhachBefore + 1
    RAISERROR(N'FAIL [vw_DashboardSummary] SoKhachMoiThangNay did not increment by 1', 16, 1);

PRINT N'PASS [vw_DashboardSummary] SoKhachMoiThangNay increments for new customer';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: Flight departing today increments SoChuyenBayHomNay
BEGIN TRAN;

DECLARE @ChuyenBefore INT;
SELECT @ChuyenBefore = SoChuyenBayHomNay FROM dbo.vw_DashboardSummary;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DX1', N'DX1 Airport', N'City X', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DX2', N'DX2 Airport', N'City Y', N'VN');

-- Insert a flight departing today (UTC) at noon
DECLARE @TodayFlight DATETIME2(0) = CAST(CAST(SYSUTCDATETIME() AS DATE) AS DATETIME2(0));
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DX01_' + CAST(@@SPID AS VARCHAR), 'DX1', 'DX2', @TodayFlight, 90, 300000);

DECLARE @ChuyenAfter INT;
SELECT @ChuyenAfter = SoChuyenBayHomNay FROM dbo.vw_DashboardSummary;

IF @ChuyenAfter <> @ChuyenBefore + 1
    RAISERROR(N'FAIL [vw_DashboardSummary] SoChuyenBayHomNay did not increment by 1', 16, 1);

PRINT N'PASS [vw_DashboardSummary] SoChuyenBayHomNay increments for flight today';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_DashboardSummary: all tests passed ===';
GO
