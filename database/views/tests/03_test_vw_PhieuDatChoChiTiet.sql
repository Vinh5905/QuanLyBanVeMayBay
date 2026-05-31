USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_PhieuDatChoChiTiet ===';
GO

-- Test 1: Booking record appears with correct fields and positive PhutsConLai for a future deadline
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('P01', N'P01 Airport', N'City A', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('P02', N'P02 Airport', N'City B', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Phieu Test');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'PT_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(DAY, 7, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('P01F_' + CAST(@@SPID AS VARCHAR), 'P01', 'P02', @NgayBay, 90, 600000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

DECLARE @HanThanhToan DATETIME2(0) = DATEADD(HOUR, 2, SYSUTCDATETIME());
INSERT INTO dbo.PHIEUDATCHO
    (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
VALUES (@MaKH, @MaCB, @MaHV, 2, 1200000, 'DANG_GIU_CHO', @HanThanhToan);
DECLARE @MaPDC INT = SCOPE_IDENTITY();

DECLARE @TrangThai    VARCHAR(30);
DECLARE @SoLuong      INT;
DECLARE @PhutsConLai  INT;
DECLARE @TuyenBay     NVARCHAR(50);

SELECT
    @TrangThai   = TrangThaiDatCho,
    @SoLuong     = SoLuongVe,
    @PhutsConLai = PhutsConLai,
    @TuyenBay    = TuyenBay
FROM dbo.vw_PhieuDatChoChiTiet
WHERE MaPhieuDatCho = @MaPDC;

IF @TrangThai <> 'DANG_GIU_CHO'
    RAISERROR(N'FAIL [vw_PhieuDatChoChiTiet] TrangThaiDatCho incorrect', 16, 1);
IF @SoLuong <> 2
    RAISERROR(N'FAIL [vw_PhieuDatChoChiTiet] SoLuongVe incorrect', 16, 1);
IF @PhutsConLai <= 0
    RAISERROR(N'FAIL [vw_PhieuDatChoChiTiet] PhutsConLai should be positive for future deadline', 16, 1);
IF @TuyenBay <> N'P01 → P02'
    RAISERROR(N'FAIL [vw_PhieuDatChoChiTiet] TuyenBay incorrect', 16, 1);

PRINT N'PASS [vw_PhieuDatChoChiTiet] Fields and PhutsConLai correct';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Expired booking shows negative PhutsConLai
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('P03', N'P03 Airport', N'City C', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('P04', N'P04 Airport', N'City D', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Phieu Test 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'PT_HangVe2_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @NgayBay2 DATETIME2(0) = DATEADD(DAY, 7, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('P03F_' + CAST(@@SPID AS VARCHAR), 'P03', 'P04', @NgayBay2, 90, 500000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();

DECLARE @HanExpired DATETIME2(0) = DATEADD(HOUR, -1, SYSUTCDATETIME());
INSERT INTO dbo.PHIEUDATCHO
    (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
VALUES (@MaKH2, @MaCB2, @MaHV2, 1, 500000, 'DANG_GIU_CHO', @HanExpired);
DECLARE @MaPDC2 INT = SCOPE_IDENTITY();

DECLARE @Phuts2 INT;
SELECT @Phuts2 = PhutsConLai FROM dbo.vw_PhieuDatChoChiTiet WHERE MaPhieuDatCho = @MaPDC2;
IF @Phuts2 >= 0
    RAISERROR(N'FAIL [vw_PhieuDatChoChiTiet] PhutsConLai should be negative for expired deadline', 16, 1);

PRINT N'PASS [vw_PhieuDatChoChiTiet] Expired booking shows negative PhutsConLai';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_PhieuDatChoChiTiet: all tests passed ===';
GO
