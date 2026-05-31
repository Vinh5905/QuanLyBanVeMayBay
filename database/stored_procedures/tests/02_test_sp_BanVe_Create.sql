USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: sp_BanVe_Create ===';
GO

-- ─── Fixture helpers ─────────────────────────────────────────────────────────
-- Each test wraps its own BEGIN TRAN / ROLLBACK so fixtures are isolated.
-- We insert minimal data: SANBAY, HANGVE, KHACHHANG, CHUYENBAY, CT_HANGVE.
-- ─────────────────────────────────────────────────────────────────────────────

-- Test 1: Happy path — creates a HOP_LE ticket and increments SoGheDaDat
BEGIN TRAN;

-- Fixtures
INSERT INTO dbo.HANGTHANHVIEN (TenHang, DiemToiThieu, TyLeGiamGia)
VALUES (N'TEST_HANG', 0, 0);

INSERT INTO dbo.KHACHHANG (HoTen, Email)
VALUES (N'Test KH Ban Ve', 'test_banve@example.com');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('TST', N'Test Airport', N'Test City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('TSU', N'Test Airport 2', N'Test City 2', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'TEST_ECONOMY', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

-- Flight 48 hours from now (well outside the 24h selling window)
DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('TST001', 'TST', 'TSU', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

-- Execute
DECLARE @MaVe INT;
EXEC dbo.sp_BanVe_Create
    @MaChuyenBay  = @MaCB,
    @MaKhachHang  = @MaKH,
    @MaHangVe     = @MaHV,
    @NgayGiaoDich = '2024-01-01',
    @MaVe         = @MaVe OUTPUT;

-- Assertions
IF @MaVe IS NULL OR @MaVe <= 0
    RAISERROR(N'FAIL [sp_BanVe_Create] Happy path: MaVe should be > 0', 16, 1);

DECLARE @TrangThai VARCHAR(30);
SELECT @TrangThai = TrangThaiVe FROM dbo.VE WHERE MaVe = @MaVe;
IF @TrangThai <> 'HOP_LE'
    RAISERROR(N'FAIL [sp_BanVe_Create] Happy path: TrangThaiVe should be HOP_LE', 16, 1);

DECLARE @GheDaDat INT;
SELECT @GheDaDat = SoGheDaDat FROM dbo.CT_HANGVE
WHERE MaChuyenBay = @MaCB AND MaHangVe = @MaHV;
IF @GheDaDat <> 1
    RAISERROR(N'FAIL [sp_BanVe_Create] Happy path: SoGheDaDat should be 1 after sale', 16, 1);

PRINT N'PASS [sp_BanVe_Create] Happy path';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Flight does not exist → ErrorCode 1001
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Test 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

DECLARE @MaVe2 INT;
EXEC dbo.sp_BanVe_Create
    @MaChuyenBay  = 999999,
    @MaKhachHang  = @MaKH2,
    @MaHangVe     = 1,
    @NgayGiaoDich = '2024-01-01',
    @MaVe         = @MaVe2 OUTPUT;

IF @MaVe2 IS NOT NULL
    RAISERROR(N'FAIL [sp_BanVe_Create] Non-existent flight: should return NULL MaVe', 16, 1);

PRINT N'PASS [sp_BanVe_Create] Non-existent flight returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: No seats available → ErrorCode 1005
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Test 3');
DECLARE @MaKH3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
    VALUES ('TS3', N'Airport 3', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
    VALUES ('TS4', N'Airport 4', N'City', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'TEST_FULL_CLASS', 1.0);
DECLARE @MaHV3 INT = SCOPE_IDENTITY();

DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('FULL01', 'TS3', 'TS4', @NgayBay3, 90, 500000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();

-- SoLuong = SoGheDaDat → fully booked
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB3, @MaHV3, 5, 5, 500000);

DECLARE @MaVe3 INT;
EXEC dbo.sp_BanVe_Create
    @MaChuyenBay  = @MaCB3,
    @MaKhachHang  = @MaKH3,
    @MaHangVe     = @MaHV3,
    @NgayGiaoDich = '2024-01-01',
    @MaVe         = @MaVe3 OUTPUT;

IF @MaVe3 IS NOT NULL
    RAISERROR(N'FAIL [sp_BanVe_Create] No seats: should not create VE', 16, 1);

PRINT N'PASS [sp_BanVe_Create] No seats available returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 4: Flight departure already past selling window → ErrorCode 1002
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Test 4');
DECLARE @MaKH4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
    VALUES ('TS5', N'Airport 5', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
    VALUES ('TS6', N'Airport 6', N'City', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'TEST_CLOSED_CLASS', 1.0);
DECLARE @MaHV4 INT = SCOPE_IDENTITY();

-- Departure in 30 minutes — within the 45-minute no-sell window
DECLARE @NgayBay4 DATETIME2(0) = DATEADD(MINUTE, 30, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('CLSD01', 'TS5', 'TS6', @NgayBay4, 90, 500000);
DECLARE @MaCB4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB4, @MaHV4, 10, 0, 500000);

DECLARE @MaVe4 INT;
EXEC dbo.sp_BanVe_Create
    @MaChuyenBay  = @MaCB4,
    @MaKhachHang  = @MaKH4,
    @MaHangVe     = @MaHV4,
    @NgayGiaoDich = '2024-01-01',
    @MaVe         = @MaVe4 OUTPUT;

IF @MaVe4 IS NOT NULL
    RAISERROR(N'FAIL [sp_BanVe_Create] Closed window: should not create VE', 16, 1);

PRINT N'PASS [sp_BanVe_Create] Selling window closed returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== sp_BanVe_Create: all tests passed ===';
GO
