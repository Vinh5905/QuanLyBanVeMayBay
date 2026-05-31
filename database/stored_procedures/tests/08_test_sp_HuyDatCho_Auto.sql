USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: sp_HuyDatCho_Auto ===';
GO

-- Test 1: Cancels expired DANG_GIU_CHO reservations and returns seats
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Auto 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('AU1', N'AU A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('AU2', N'AU B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'AU_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();
DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 10, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('AUC001', 'AU1', 'AU2', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

-- Manually insert an already-expired PHIEUDATCHO + VE
DECLARE @ExpiredHan DATETIME2(0) = DATEADD(HOUR, -1, SYSUTCDATETIME()); -- 1 hour ago
INSERT INTO dbo.PHIEUDATCHO
    (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
VALUES (@MaKH, @MaCB, @MaHV, 1, 500000, 'DANG_GIU_CHO', @ExpiredHan);
DECLARE @MaPDC INT = SCOPE_IDENTITY();

DECLARE @MaVeCode VARCHAR(30) = 'VE_AU_EXP_' + CAST(@@SPID AS VARCHAR(10));
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
VALUES (@MaVeCode, @MaCB, @MaHV, @MaKH, @MaPDC, 500000, 'DANG_GIU_CHO');

-- Manually set SoGheDaDat = 1 to simulate seat held
UPDATE dbo.CT_HANGVE SET SoGheDaDat = 1 WHERE MaChuyenBay=@MaCB AND MaHangVe=@MaHV;

-- Run auto-cancel
EXEC dbo.sp_HuyDatCho_Auto;

-- Verify PHIEUDATCHO is now DA_HUY
DECLARE @PDCStatus VARCHAR(30);
SELECT @PDCStatus = TrangThaiDatCho FROM dbo.PHIEUDATCHO WHERE MaPhieuDatCho = @MaPDC;
IF @PDCStatus <> 'DA_HUY'
    RAISERROR(N'FAIL [sp_HuyDatCho_Auto] PHIEUDATCHO should be DA_HUY', 16, 1);

-- Verify VE is DA_HUY
DECLARE @VeStatus VARCHAR(30);
SELECT @VeStatus = TrangThaiVe FROM dbo.VE WHERE MaPhieuDatCho = @MaPDC;
IF @VeStatus <> 'DA_HUY'
    RAISERROR(N'FAIL [sp_HuyDatCho_Auto] VE should be DA_HUY', 16, 1);

-- Seat should be returned (back to 0)
DECLARE @Seats INT;
SELECT @Seats = SoGheDaDat FROM dbo.CT_HANGVE WHERE MaChuyenBay=@MaCB AND MaHangVe=@MaHV;
IF @Seats <> 0
    RAISERROR(N'FAIL [sp_HuyDatCho_Auto] SoGheDaDat should be 0 after auto-cancel', 16, 1);

PRINT N'PASS [sp_HuyDatCho_Auto] Expired reservations cancelled and seats returned';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: No expired reservations → returns 0 counts without error
BEGIN TRAN;

EXEC dbo.sp_HuyDatCho_Auto;
-- Just verifying it runs without error
PRINT N'PASS [sp_HuyDatCho_Auto] No expired reservations runs cleanly';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== sp_HuyDatCho_Auto: all tests passed ===';
GO
