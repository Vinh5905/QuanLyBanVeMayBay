USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_HanhLyTheoVe ===';
GO

-- Test 1: Ticket with two GOIHANHLY packages and multiple pieces shows correct totals
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('HL1', N'HL1 Airport', N'City H', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('HL2', N'HL2 Airport', N'City I', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH HanhLy Test');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'HL_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

INSERT INTO dbo.BANGGIA_HANHLY (TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay)
VALUES (N'HL_BangGia_' + CAST(@@SPID AS NVARCHAR), 23.0, 200000, 300000);
DECLARE @MaBG INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('HL01_' + CAST(@@SPID AS VARCHAR), 'HL1', 'HL2', @NgayBay, 90, 400000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('HL_VE_' + CAST(@@SPID AS VARCHAR), @MaCB, @MaHV, @MaKH, 400000, 'HOP_LE');
DECLARE @MaVe INT = SCOPE_IDENTITY();

-- Package 1: 20kg, 200000 VND, with 1 piece
INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
VALUES (@MaVe, @MaBG, 20.0, 200000, 'REGISTERED');
DECLARE @MaGoi1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong)
VALUES (@MaGoi1, 'KHL1_' + CAST(@@SPID AS VARCHAR), 20.0);

-- Package 2: 10kg, 100000 VND, with 2 pieces
INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
VALUES (@MaVe, @MaBG, 10.0, 100000, 'REGISTERED');
DECLARE @MaGoi2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong)
VALUES (@MaGoi2, 'KHL2A_' + CAST(@@SPID AS VARCHAR), 5.0);
INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong)
VALUES (@MaGoi2, 'KHL2B_' + CAST(@@SPID AS VARCHAR), 5.0);

DECLARE @SoKien         INT;
DECLARE @TongKg         DECIMAL(6,2);
DECLARE @TongTienHL     DECIMAL(18,2);

SELECT
    @SoKien     = SoKien,
    @TongKg     = TongKg,
    @TongTienHL = TongTienHanhLy
FROM dbo.vw_HanhLyTheoVe
WHERE MaVe = @MaVe;

IF @SoKien <> 3
    RAISERROR(N'FAIL [vw_HanhLyTheoVe] SoKien should be 3 (1+2)', 16, 1);
IF @TongKg <> 30.0
    RAISERROR(N'FAIL [vw_HanhLyTheoVe] TongKg should be 30.0 (20+10)', 16, 1);
IF @TongTienHL <> 300000
    RAISERROR(N'FAIL [vw_HanhLyTheoVe] TongTienHanhLy should be 300000 (200000+100000)', 16, 1);

PRINT N'PASS [vw_HanhLyTheoVe] SoKien, TongKg, TongTienHanhLy correct for two packages';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Ticket with no baggage shows zeros
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('HN1', N'HN1 Airport', N'City N', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('HN2', N'HN2 Airport', N'City O', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH NoBag Test');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia)
VALUES (N'HN_HangVe_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @NgayBay2 DATETIME2(0) = DATEADD(DAY, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('HN01_' + CAST(@@SPID AS VARCHAR), 'HN1', 'HN2', @NgayBay2, 90, 350000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('HN_VE_' + CAST(@@SPID AS VARCHAR), @MaCB2, @MaHV2, @MaKH2, 350000, 'HOP_LE');
DECLARE @MaVeNoBag INT = SCOPE_IDENTITY();

DECLARE @SoKien2 INT, @TongTien2 DECIMAL(18,2);
SELECT @SoKien2 = SoKien, @TongTien2 = TongTienHanhLy
FROM dbo.vw_HanhLyTheoVe
WHERE MaVe = @MaVeNoBag;

IF @SoKien2 <> 0 OR @TongTien2 <> 0
    RAISERROR(N'FAIL [vw_HanhLyTheoVe] Ticket with no baggage should show 0', 16, 1);

PRINT N'PASS [vw_HanhLyTheoVe] Ticket with no baggage shows zeros';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_HanhLyTheoVe: all tests passed ===';
GO
