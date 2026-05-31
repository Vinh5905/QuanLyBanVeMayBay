USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: tr_AutoUpdateTimestamp ===';
GO

-- Strategy: set UpdatedAt to a known past value (trigger skips because UPDATE(UpdatedAt)=true),
-- then do an update that does NOT touch UpdatedAt and verify the trigger auto-sets it.

-- Test 1: TAIKHOAN — trigger updates UpdatedAt on non-UpdatedAt UPDATE
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'TK_TS1');
DECLARE @MaKH1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.VAITRO (TenVaiTro) VALUES ('ROLE_TS1_' + CAST(@@SPID AS VARCHAR));
DECLARE @MaVT1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, MaKhachHang)
VALUES ('ts1_user_' + CAST(@@SPID AS VARCHAR), 'hash', @MaVT1, @MaKH1);
DECLARE @MaTK1 INT = SCOPE_IDENTITY();

-- Force UpdatedAt to a known past time (trigger skips because we're explicitly setting it)
UPDATE dbo.TAIKHOAN SET UpdatedAt = '2020-01-01 00:00:00' WHERE MaTaiKhoan = @MaTK1;

DECLARE @BeforeUpd DATETIME2(0);
SELECT @BeforeUpd = UpdatedAt FROM dbo.TAIKHOAN WHERE MaTaiKhoan = @MaTK1;
IF @BeforeUpd <> '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_TAIKHOAN_AutoUpdateTimestamp] Could not set past UpdatedAt for test setup', 16, 1);

-- Now update a non-UpdatedAt column → trigger should auto-set UpdatedAt
UPDATE dbo.TAIKHOAN SET Email = 'trigger_test@example.com' WHERE MaTaiKhoan = @MaTK1;

DECLARE @AfterUpd DATETIME2(0);
SELECT @AfterUpd = UpdatedAt FROM dbo.TAIKHOAN WHERE MaTaiKhoan = @MaTK1;
IF @AfterUpd <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_TAIKHOAN_AutoUpdateTimestamp] UpdatedAt not updated by trigger', 16, 1);

PRINT N'PASS [tr_TAIKHOAN_AutoUpdateTimestamp] Auto-sets UpdatedAt on non-UpdatedAt update';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: KHACHHANG — trigger updates UpdatedAt
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen, Email)
VALUES (N'KH_TS2', 'kh_ts2@example.com');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

UPDATE dbo.KHACHHANG SET UpdatedAt = '2020-01-01 00:00:00' WHERE MaKhachHang = @MaKH2;

UPDATE dbo.KHACHHANG SET HoTen = N'KH_TS2_Updated' WHERE MaKhachHang = @MaKH2;

DECLARE @KHAfter DATETIME2(0);
SELECT @KHAfter = UpdatedAt FROM dbo.KHACHHANG WHERE MaKhachHang = @MaKH2;
IF @KHAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_KHACHHANG_AutoUpdateTimestamp] UpdatedAt not updated by trigger', 16, 1);

PRINT N'PASS [tr_KHACHHANG_AutoUpdateTimestamp] Auto-sets UpdatedAt on non-UpdatedAt update';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: CHUYENBAY — trigger updates UpdatedAt
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AUT', N'Auto Test Airport', N'Auto City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AU2', N'Auto Test Airport 2', N'Auto City 2', N'VN');

DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('AUT001', 'AUT', 'AU2', @NgayBay3, 90, 300000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();

UPDATE dbo.CHUYENBAY SET UpdatedAt = '2020-01-01 00:00:00' WHERE MaChuyenBay = @MaCB3;

UPDATE dbo.CHUYENBAY SET GiaCoBan = 350000 WHERE MaChuyenBay = @MaCB3;

DECLARE @CBAfter DATETIME2(0);
SELECT @CBAfter = UpdatedAt FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB3;
IF @CBAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_CHUYENBAY_AutoUpdateTimestamp] UpdatedAt not updated by trigger', 16, 1);

PRINT N'PASS [tr_CHUYENBAY_AutoUpdateTimestamp] Auto-sets UpdatedAt on non-UpdatedAt update';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 4: VE — trigger updates UpdatedAt
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_VE_TS4');
DECLARE @MaKH4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AV4', N'Airport VE4', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AV5', N'Airport VE5', N'City', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HANGVE_TS4', 1.0);
DECLARE @MaHV4 INT = SCOPE_IDENTITY();

DECLARE @NgayBay4 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('AV4001', 'AV4', 'AV5', @NgayBay4, 90, 400000);
DECLARE @MaCB4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('VETS4_' + CAST(@@SPID AS VARCHAR), @MaCB4, @MaHV4, @MaKH4, 400000, 'HOP_LE');
DECLARE @MaVe4 INT = SCOPE_IDENTITY();

UPDATE dbo.VE SET UpdatedAt = '2020-01-01 00:00:00' WHERE MaVe = @MaVe4;

UPDATE dbo.VE SET GiaVe = 420000 WHERE MaVe = @MaVe4;

DECLARE @VEAfter DATETIME2(0);
SELECT @VEAfter = UpdatedAt FROM dbo.VE WHERE MaVe = @MaVe4;
IF @VEAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_VE_AutoUpdateTimestamp] UpdatedAt not updated by trigger', 16, 1);

PRINT N'PASS [tr_VE_AutoUpdateTimestamp] Auto-sets UpdatedAt on non-UpdatedAt update';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 5: PHIEUDATCHO — trigger updates UpdatedAt
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_PDC_TS5');
DECLARE @MaKH5 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AP5', N'Airport PDC5', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('AP6', N'Airport PDC6', N'City', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HANGVE_TS5', 1.0);
DECLARE @MaHV5 INT = SCOPE_IDENTITY();

DECLARE @NgayBay5 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('AP5001', 'AP5', 'AP6', @NgayBay5, 90, 500000);
DECLARE @MaCB5 INT = SCOPE_IDENTITY();

INSERT INTO dbo.PHIEUDATCHO
    (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
VALUES (@MaKH5, @MaCB5, @MaHV5, 1, 500000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));
DECLARE @MaPDC5 INT = SCOPE_IDENTITY();

UPDATE dbo.PHIEUDATCHO SET UpdatedAt = '2020-01-01 00:00:00' WHERE MaPhieuDatCho = @MaPDC5;

UPDATE dbo.PHIEUDATCHO SET SoLuongVe = 1 WHERE MaPhieuDatCho = @MaPDC5;

DECLARE @PDCAfter DATETIME2(0);
SELECT @PDCAfter = UpdatedAt FROM dbo.PHIEUDATCHO WHERE MaPhieuDatCho = @MaPDC5;
IF @PDCAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_PHIEUDATCHO_AutoUpdateTimestamp] UpdatedAt not updated by trigger', 16, 1);

PRINT N'PASS [tr_PHIEUDATCHO_AutoUpdateTimestamp] Auto-sets UpdatedAt on non-UpdatedAt update';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== tr_AutoUpdateTimestamp: all tests passed ===';
GO
