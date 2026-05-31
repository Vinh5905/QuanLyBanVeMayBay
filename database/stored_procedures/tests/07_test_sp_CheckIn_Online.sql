USE [$(DB_NAME)];
GO

PRINT N'=== TEST: sp_CheckIn_Online ===';
GO

-- Test 1: Happy path — check-in within valid window, returns boarding pass
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH CheckIn 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI1', N'CI A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI2', N'CI B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'CI_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

-- Departure 5 hours from now: within (24h open, 1h close) window
DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('CIC001', 'CI1', 'CI2', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

DECLARE @MaVe INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB, @MaKhachHang=@MaKH, @MaHangVe=@MaHV,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe OUTPUT;

DECLARE @MaCheckIn INT;
EXEC dbo.sp_CheckIn_Online
    @MaVe            = @MaVe,
    @SoGhe           = '12A',
    @ThoiDiemCheckIn = NULL,   -- uses SYSUTCDATETIME()
    @MaCheckIn       = @MaCheckIn OUTPUT;

IF @MaCheckIn IS NULL OR @MaCheckIn <= 0
    RAISERROR(N'FAIL [sp_CheckIn_Online] Happy path: MaCheckIn should be > 0', 16, 1);

DECLARE @BPCode VARCHAR(100);
SELECT @BPCode = BoardingPassCode FROM dbo.CHECKIN WHERE MaCheckIn = @MaCheckIn;
IF @BPCode IS NULL OR LEN(@BPCode) < 10
    RAISERROR(N'FAIL [sp_CheckIn_Online] Happy path: BoardingPassCode should be non-empty', 16, 1);

PRINT N'PASS [sp_CheckIn_Online] Happy path';

ROLLBACK;
GO

-- Test 2: Check-in before window opens → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH CheckIn 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI3', N'CI C', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI4', N'CI D', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'CI_ECO2', 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

-- Departure 30 hours from now: window opens at departure-24h = 6h from now
DECLARE @NgayBay2 DATETIME2(0) = DATEADD(HOUR, 30, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('CIC002', 'CI3', 'CI4', @NgayBay2, 90, 500000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB2, @MaHV2, 10, 0, 500000);

DECLARE @MaVe2 INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB2, @MaKhachHang=@MaKH2, @MaHangVe=@MaHV2,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe2 OUTPUT;

-- Try check-in right now: window doesn't open until 6 hours from now
DECLARE @MaCI2 INT;
EXEC dbo.sp_CheckIn_Online
    @MaVe            = @MaVe2,
    @SoGhe           = '10B',
    @ThoiDiemCheckIn = NULL,   -- now, which is before window opens
    @MaCheckIn       = @MaCI2 OUTPUT;

IF @MaCI2 IS NOT NULL
    RAISERROR(N'FAIL [sp_CheckIn_Online] Before window: should not check in', 16, 1);

PRINT N'PASS [sp_CheckIn_Online] Before check-in window returns error';

ROLLBACK;
GO

-- Test 3: Check-in after window closes → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH CheckIn 3');
DECLARE @MaKH3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI5', N'CI E', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI6', N'CI F', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'CI_ECO3', 1.0);
DECLARE @MaHV3 INT = SCOPE_IDENTITY();

-- Departure in 30 minutes: window closes at departure-60min = -30min (already past)
DECLARE @NgayBay3 DATETIME2(0) = DATEADD(MINUTE, 30, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('CIC003', 'CI5', 'CI6', @NgayBay3, 90, 500000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB3, @MaHV3, 10, 0, 500000);

-- Manually insert HOP_LE ticket (bypass BanVe time-window which would also block this)
DECLARE @MaVeCode3 VARCHAR(30) = 'VE_TEST_CI_CLOSED_' + CAST(@@SPID AS VARCHAR(10));
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES (@MaVeCode3, @MaCB3, @MaHV3, @MaKH3, 500000, 'HOP_LE');
DECLARE @MaVe3 INT = SCOPE_IDENTITY();
UPDATE dbo.CT_HANGVE SET SoGheDaDat = 1 WHERE MaChuyenBay=@MaCB3 AND MaHangVe=@MaHV3;

DECLARE @MaCI3 INT;
EXEC dbo.sp_CheckIn_Online
    @MaVe            = @MaVe3,
    @SoGhe           = '5C',
    @ThoiDiemCheckIn = NULL,   -- now is after close (departure - 60min = -30min)
    @MaCheckIn       = @MaCI3 OUTPUT;

IF @MaCI3 IS NOT NULL
    RAISERROR(N'FAIL [sp_CheckIn_Online] After window closed: should not check in', 16, 1);

PRINT N'PASS [sp_CheckIn_Online] After check-in window closes returns error';

ROLLBACK;
GO

-- Test 4: Duplicate check-in → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH CheckIn 4');
DECLARE @MaKH4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI7', N'CI G', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('CI8', N'CI H', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'CI_ECO4', 1.0);
DECLARE @MaHV4 INT = SCOPE_IDENTITY();
DECLARE @NgayBay4 DATETIME2(0) = DATEADD(HOUR, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('CIC004', 'CI7', 'CI8', @NgayBay4, 90, 500000);
DECLARE @MaCB4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB4, @MaHV4, 10, 0, 500000);

DECLARE @MaVe4 INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB4, @MaKhachHang=@MaKH4, @MaHangVe=@MaHV4,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe4 OUTPUT;

-- First check-in
DECLARE @MaCI4a INT;
EXEC dbo.sp_CheckIn_Online @MaVe=@MaVe4, @SoGhe='1A', @MaCheckIn=@MaCI4a OUTPUT;

-- Second check-in attempt
DECLARE @MaCI4b INT;
EXEC dbo.sp_CheckIn_Online @MaVe=@MaVe4, @SoGhe='1A', @MaCheckIn=@MaCI4b OUTPUT;

IF @MaCI4b IS NOT NULL
    RAISERROR(N'FAIL [sp_CheckIn_Online] Duplicate: second check-in should fail', 16, 1);

PRINT N'PASS [sp_CheckIn_Online] Duplicate check-in returns error';

ROLLBACK;
GO

PRINT N'=== sp_CheckIn_Online: all tests passed ===';
GO
