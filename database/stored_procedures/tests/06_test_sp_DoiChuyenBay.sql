USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: sp_DoiChuyenBay ===';
GO

-- Test 1: Happy path — changes flight on same route, records fee, adjusts seat counts
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DoiChuyen 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DC1', N'DC A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DC2', N'DC B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'DC_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay1 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
DECLARE @NgayBay2 DATETIME2(0) = DATEADD(HOUR, 72, SYSUTCDATETIME());

INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DCC001', 'DC1', 'DC2', @NgayBay1, 90, 500000);
DECLARE @MaCB1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DCC002', 'DC1', 'DC2', @NgayBay2, 90, 550000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB1, @MaHV, 10, 0, 500000);
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB2, @MaHV, 10, 0, 550000);

-- Create HOP_LE ticket on first flight
DECLARE @MaVe INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB1, @MaKhachHang=@MaKH, @MaHangVe=@MaHV,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe OUTPUT;

-- Change to second flight
DECLARE @MaTTPhi INT;
EXEC dbo.sp_DoiChuyenBay
    @MaVe           = @MaVe,
    @MaChuyenBayMoi = @MaCB2,
    @MaThanhToanPhi = @MaTTPhi OUTPUT;

IF @MaTTPhi IS NULL OR @MaTTPhi <= 0
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Happy path: MaThanhToanPhi should be > 0', 16, 1);

-- VE should now point to new flight and be HOP_LE
DECLARE @VeCB INT; DECLARE @VeStatus VARCHAR(30);
SELECT @VeCB = MaChuyenBay, @VeStatus = TrangThaiVe FROM dbo.VE WHERE MaVe = @MaVe;
IF @VeCB <> @MaCB2
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Happy path: VE.MaChuyenBay should be new flight', 16, 1);
IF @VeStatus <> 'HOP_LE'
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Happy path: TrangThaiVe should be HOP_LE', 16, 1);

-- Old flight seat count should be 0
DECLARE @OldSeats INT;
SELECT @OldSeats = SoGheDaDat FROM dbo.CT_HANGVE WHERE MaChuyenBay=@MaCB1 AND MaHangVe=@MaHV;
IF @OldSeats <> 0
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Happy path: old flight SoGheDaDat should be 0', 16, 1);

-- New flight seat count should be 1
DECLARE @NewSeats INT;
SELECT @NewSeats = SoGheDaDat FROM dbo.CT_HANGVE WHERE MaChuyenBay=@MaCB2 AND MaHangVe=@MaHV;
IF @NewSeats <> 1
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Happy path: new flight SoGheDaDat should be 1', 16, 1);

PRINT N'PASS [sp_DoiChuyenBay] Happy path';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: New flight on different route → error (SanBayDen differs)
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DoiChuyen 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DC3', N'DC C', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DC4', N'DC D', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DC5', N'DC E', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'DC_ECO2', 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @NgayBay2a DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
DECLARE @NgayBay2b DATETIME2(0) = DATEADD(HOUR, 72, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DCC003', 'DC3', 'DC4', @NgayBay2a, 90, 500000);
DECLARE @MaCB2a INT = SCOPE_IDENTITY();
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DCC004', 'DC3', 'DC5', @NgayBay2b, 90, 500000);  -- different destination
DECLARE @MaCB2b INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB2a, @MaHV2, 10, 0, 500000);
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB2b, @MaHV2, 10, 0, 500000);

DECLARE @MaVe2 INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB2a, @MaKhachHang=@MaKH2, @MaHangVe=@MaHV2,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe2 OUTPUT;

DECLARE @MaTTPhi2 INT;
EXEC dbo.sp_DoiChuyenBay @MaVe=@MaVe2, @MaChuyenBayMoi=@MaCB2b, @MaThanhToanPhi=@MaTTPhi2 OUTPUT;

IF @MaTTPhi2 IS NOT NULL
    RAISERROR(N'FAIL [sp_DoiChuyenBay] Different route: should not allow change', 16, 1);

PRINT N'PASS [sp_DoiChuyenBay] Different route returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== sp_DoiChuyenBay: all tests passed ===';
GO
