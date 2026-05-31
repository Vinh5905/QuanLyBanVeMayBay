USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_VeChiTiet ===';
GO

-- Test 1: Active ticket appears with correct customer name, route, and class
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('V01', N'V01 Airport', N'City A', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('V02', N'V02 Airport', N'City B', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen, CCCD)
VALUES (N'Nguyễn Vé Test', '099911111' + CAST(@@SPID AS VARCHAR));
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'VT_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('V01F_' + CAST(@@SPID AS VARCHAR), 'V01', 'V02', @NgayBay, 90, 400000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('VE_VT_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 400000, 'HOP_LE');
DECLARE @MaVe INT = SCOPE_IDENTITY();

DECLARE @HoTen   NVARCHAR(150), @TuyenBay NVARCHAR(50), @TrangThai VARCHAR(30);
SELECT
    @HoTen    = HoTenKhach,
    @TuyenBay = TuyenBay,
    @TrangThai = TrangThaiVe
FROM dbo.vw_VeChiTiet
WHERE MaVe = @MaVe;

IF @HoTen <> N'Nguyễn Vé Test'
    RAISERROR(N'FAIL [vw_VeChiTiet] HoTenKhach incorrect', 16, 1);
IF @TuyenBay <> N'V01 → V02'
    RAISERROR(N'FAIL [vw_VeChiTiet] TuyenBay incorrect', 16, 1);
IF @TrangThai <> 'HOP_LE'
    RAISERROR(N'FAIL [vw_VeChiTiet] TrangThaiVe incorrect', 16, 1);

PRINT N'PASS [vw_VeChiTiet] Active ticket visible with correct fields';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Soft-deleted ticket does not appear in the view
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('V03', N'V03 Airport', N'City C', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('V04', N'V04 Airport', N'City D', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Del Test');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'VT_HV2_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @NgayBay2 DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('V03F_' + CAST(@@SPID AS VARCHAR), 'V03', 'V04', @NgayBay2, 90, 300000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe, IsDeleted)
VALUES ('VE_DEL_' + CAST(@@SPID AS VARCHAR), @MaCB2, @MaHV2, @MaKH2, 300000, 'DA_HUY', 1);
DECLARE @MaVeDel INT = SCOPE_IDENTITY();

DECLARE @DelCount INT;
SELECT @DelCount = COUNT(*) FROM dbo.vw_VeChiTiet WHERE MaVe = @MaVeDel;
IF @DelCount <> 0
    RAISERROR(N'FAIL [vw_VeChiTiet] Soft-deleted ticket must not appear', 16, 1);

PRINT N'PASS [vw_VeChiTiet] Soft-deleted ticket excluded';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_VeChiTiet: all tests passed ===';
GO
