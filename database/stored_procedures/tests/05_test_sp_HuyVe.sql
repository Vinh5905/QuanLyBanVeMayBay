USE [$(DB_NAME)];
GO

PRINT N'=== TEST: sp_HuyVe ===';
GO

-- Helper: creates a complete HOP_LE ticket via BanVe flow
-- Test 1: Happy path — cancels HOP_LE ticket, returns seat, calculates refund
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH HuyVe 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('HV1', N'HV A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('HV2', N'HV B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HV_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();
DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 10, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('HVC001', 'HV1', 'HV2', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

DECLARE @MaVe INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB, @MaKhachHang=@MaKH, @MaHangVe=@MaHV,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe OUTPUT;

-- SoGheDaDat should be 1 now
DECLARE @PhiHuy DECIMAL(18,2), @SoTienHoan DECIMAL(18,2);
EXEC dbo.sp_HuyVe
    @MaVe       = @MaVe,
    @NguoiHuy   = NULL,
    @LyDoHuy    = N'Test hủy',
    @PhiHuy     = @PhiHuy OUTPUT,
    @SoTienHoan = @SoTienHoan OUTPUT;

IF @PhiHuy IS NULL
    RAISERROR(N'FAIL [sp_HuyVe] Happy path: PhiHuy should not be NULL', 16, 1);

-- VE should be DA_HUY and IsDeleted = 1
DECLARE @VeStatus VARCHAR(30); DECLARE @IsDeleted BIT;
SELECT @VeStatus = TrangThaiVe, @IsDeleted = IsDeleted FROM dbo.VE WHERE MaVe = @MaVe;
IF @VeStatus <> 'DA_HUY'
    RAISERROR(N'FAIL [sp_HuyVe] Happy path: TrangThaiVe should be DA_HUY', 16, 1);
IF @IsDeleted <> 1
    RAISERROR(N'FAIL [sp_HuyVe] Happy path: IsDeleted should be 1', 16, 1);

-- Seat should be returned (SoGheDaDat back to 0)
DECLARE @GheDaDat INT;
SELECT @GheDaDat = SoGheDaDat FROM dbo.CT_HANGVE WHERE MaChuyenBay=@MaCB AND MaHangVe=@MaHV;
IF @GheDaDat <> 0
    RAISERROR(N'FAIL [sp_HuyVe] Happy path: SoGheDaDat should be 0 after cancellation', 16, 1);

-- SoTienHoanLai = GiaVe (500000) - PhiHuy (100000) = 400000
IF @SoTienHoan <> 400000
    RAISERROR(N'FAIL [sp_HuyVe] Happy path: SoTienHoanLai should be 400000', 16, 1);

PRINT N'PASS [sp_HuyVe] Happy path';

ROLLBACK;
GO

-- Test 2: Cancel non-existent ticket → error
BEGIN TRAN;

DECLARE @Ph2 DECIMAL(18,2), @Sr2 DECIMAL(18,2);
EXEC dbo.sp_HuyVe @MaVe=999999, @PhiHuy=@Ph2 OUTPUT, @SoTienHoan=@Sr2 OUTPUT;

IF @Ph2 IS NOT NULL
    RAISERROR(N'FAIL [sp_HuyVe] Non-existent: PhiHuy should be NULL', 16, 1);

PRINT N'PASS [sp_HuyVe] Non-existent ticket returns error';

ROLLBACK;
GO

-- Test 3: Cancel already-cancelled ticket → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH HuyVe 3');
DECLARE @MaKH3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('HV3', N'HV C', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('HV4', N'HV D', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HV_ECO3', 1.0);
DECLARE @MaHV3 INT = SCOPE_IDENTITY();
DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 10, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('HVC003', 'HV3', 'HV4', @NgayBay3, 90, 500000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB3, @MaHV3, 10, 0, 500000);

DECLARE @MaVe3 INT;
EXEC dbo.sp_BanVe_Create @MaChuyenBay=@MaCB3, @MaKhachHang=@MaKH3, @MaHangVe=@MaHV3,
     @NgayGiaoDich='2024-01-01', @MaVe=@MaVe3 OUTPUT;

-- Cancel once
DECLARE @Ph3a DECIMAL(18,2), @Sr3a DECIMAL(18,2);
EXEC dbo.sp_HuyVe @MaVe=@MaVe3, @PhiHuy=@Ph3a OUTPUT, @SoTienHoan=@Sr3a OUTPUT;

-- Try to cancel again
DECLARE @Ph3b DECIMAL(18,2), @Sr3b DECIMAL(18,2);
EXEC dbo.sp_HuyVe @MaVe=@MaVe3, @PhiHuy=@Ph3b OUTPUT, @SoTienHoan=@Sr3b OUTPUT;

IF @Ph3b IS NOT NULL
    RAISERROR(N'FAIL [sp_HuyVe] Double cancel: second cancel should fail', 16, 1);

PRINT N'PASS [sp_HuyVe] Double cancellation returns error';

ROLLBACK;
GO

PRINT N'=== sp_HuyVe: all tests passed ===';
GO
