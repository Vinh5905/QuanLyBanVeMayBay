USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_DoanhThuTheoChuyenBay ===';
GO

-- Test 1: Ticket revenue and baggage revenue are aggregated correctly per flight
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DR1', N'DR1 Airport', N'City R', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DR2', N'DR2 Airport', N'City S', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DoanhThu Test');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'DR_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

INSERT INTO dbo.BANGGIA_HANHLY (TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay)
VALUES (N'DR_BangGia_' + CAST(@@SPID AS NVARCHAR), 23.0, 300000, 400000);
DECLARE @MaBG INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DR01_' + CAST(@@SPID AS VARCHAR), 'DR1', 'DR2', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

-- Two HOP_LE tickets: 500000 + 500000 = 1000000
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('DR_VE1_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 500000, 'HOP_LE');
DECLARE @MaVe1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('DR_VE2_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 500000, 'HOP_LE');
DECLARE @MaVe2 INT = SCOPE_IDENTITY();

-- One cancelled ticket: should not count toward revenue
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('DR_VE3_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 500000, 'DA_HUY');

-- Baggage for VE1: 300000
INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
VALUES (@MaVe1, @MaBG, 20.0, 300000, 'REGISTERED');

DECLARE @SoVe         INT;
DECLARE @DoanhThuVe   DECIMAL(18,2);
DECLARE @DoanhThuHL   DECIMAL(18,2);
DECLARE @TongDT       DECIMAL(18,2);

SELECT
    @SoVe       = SoVeBan,
    @DoanhThuVe = DoanhThuVe,
    @DoanhThuHL = DoanhThuHanhLy,
    @TongDT     = TongDoanhThu
FROM dbo.vw_DoanhThuTheoChuyenBay
WHERE MaChuyenBay = @MaCB;

IF @SoVe <> 2
    RAISERROR(N'FAIL [vw_DoanhThuTheoChuyenBay] SoVeBan should be 2 (DA_HUY excluded)', 16, 1);
IF @DoanhThuVe <> 1000000
    RAISERROR(N'FAIL [vw_DoanhThuTheoChuyenBay] DoanhThuVe incorrect (expected 1000000)', 16, 1);
IF @DoanhThuHL <> 300000
    RAISERROR(N'FAIL [vw_DoanhThuTheoChuyenBay] DoanhThuHanhLy incorrect (expected 300000)', 16, 1);
IF @TongDT <> 1300000
    RAISERROR(N'FAIL [vw_DoanhThuTheoChuyenBay] TongDoanhThu incorrect (expected 1300000)', 16, 1);

PRINT N'PASS [vw_DoanhThuTheoChuyenBay] Ticket and baggage revenue aggregated correctly';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Flight with no tickets shows zero revenue
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DZ1', N'DZ1 Airport', N'City Z', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('DZ2', N'DZ2 Airport', N'City W', N'VN');

DECLARE @NgayBay2 DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DZ01_' + CAST(@@SPID AS VARCHAR), 'DZ1', 'DZ2', @NgayBay2, 90, 300000);
DECLARE @MaCBEmpty INT = SCOPE_IDENTITY();

DECLARE @TongEmpty DECIMAL(18,2);
SELECT @TongEmpty = TongDoanhThu FROM dbo.vw_DoanhThuTheoChuyenBay WHERE MaChuyenBay = @MaCBEmpty;

IF @TongEmpty <> 0
    RAISERROR(N'FAIL [vw_DoanhThuTheoChuyenBay] Flight with no tickets should have 0 revenue', 16, 1);

PRINT N'PASS [vw_DoanhThuTheoChuyenBay] Flight with no tickets shows zero revenue';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_DoanhThuTheoChuyenBay: all tests passed ===';
GO
