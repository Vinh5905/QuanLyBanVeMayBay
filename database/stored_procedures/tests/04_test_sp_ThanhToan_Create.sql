USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: sp_ThanhToan_Create ===';
GO

-- ─── Fixture: creates a complete DatVe setup and returns keys ────────────────

-- Test 1: Payment via MaPhieuDatCho — VE becomes HOP_LE, PHIEUDATCHO DA_THANH_TOAN
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH ThanhToan 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('TT1', N'TT A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('TT2', N'TT B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'TT_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('TTC001', 'TT1', 'TT2', @NgayBay, 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

-- Create reservation first
DECLARE @MaPhieuDat INT;
EXEC dbo.sp_DatVe_Create @MaChuyenBay=@MaCB, @MaKhachHang=@MaKH, @MaHangVe=@MaHV,
     @MaPhieuDat=@MaPhieuDat OUTPUT;

-- Pay: 500000 * 1.10 = 550000
DECLARE @MaThanhToan INT;
EXEC dbo.sp_ThanhToan_Create
    @MaPhieuDatCho     = @MaPhieuDat,
    @MaVe              = NULL,
    @HinhThucThanhToan = 'TIEN_MAT',
    @SoTienThanhToan   = 550000,
    @MaThanhToan       = @MaThanhToan OUTPUT;

IF @MaThanhToan IS NULL OR @MaThanhToan <= 0
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Via PHIEUDATCHO: MaThanhToan should be > 0', 16, 1);

DECLARE @VeStatus VARCHAR(30);
SELECT @VeStatus = TrangThaiVe FROM dbo.VE WHERE MaPhieuDatCho = @MaPhieuDat;
IF @VeStatus <> 'HOP_LE'
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Via PHIEUDATCHO: VE should be HOP_LE', 16, 1);

DECLARE @PDCStatus VARCHAR(30);
SELECT @PDCStatus = TrangThaiDatCho FROM dbo.PHIEUDATCHO WHERE MaPhieuDatCho = @MaPhieuDat;
IF @PDCStatus <> 'DA_THANH_TOAN'
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Via PHIEUDATCHO: PHIEUDATCHO should be DA_THANH_TOAN', 16, 1);

PRINT N'PASS [sp_ThanhToan_Create] Via MaPhieuDatCho happy path';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Insufficient payment amount → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH ThanhToan 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('TT3', N'TT C', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('TT4', N'TT D', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'TT_ECO2', 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();
DECLARE @NgayBay2 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('TTC002', 'TT3', 'TT4', @NgayBay2, 90, 500000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB2, @MaHV2, 10, 0, 500000);

DECLARE @MaPhieuDat2 INT;
EXEC dbo.sp_DatVe_Create @MaChuyenBay=@MaCB2, @MaKhachHang=@MaKH2, @MaHangVe=@MaHV2,
     @MaPhieuDat=@MaPhieuDat2 OUTPUT;

DECLARE @MaTT2 INT;
EXEC dbo.sp_ThanhToan_Create
    @MaPhieuDatCho     = @MaPhieuDat2,
    @MaVe              = NULL,
    @HinhThucThanhToan = 'TIEN_MAT',
    @SoTienThanhToan   = 100,   -- Way too little
    @MaThanhToan       = @MaTT2 OUTPUT;

IF @MaTT2 IS NOT NULL
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Insufficient amount: should not create THANHTOAN', 16, 1);

-- VE should still be DANG_GIU_CHO
DECLARE @VeStatus2 VARCHAR(30);
SELECT @VeStatus2 = TrangThaiVe FROM dbo.VE WHERE MaPhieuDatCho = @MaPhieuDat2;
IF @VeStatus2 <> 'DANG_GIU_CHO'
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Insufficient amount: VE should remain DANG_GIU_CHO', 16, 1);

PRINT N'PASS [sp_ThanhToan_Create] Insufficient amount returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: Both MaPhieuDatCho and MaVe provided → error
BEGIN TRAN;

DECLARE @MaTT3 INT;
EXEC dbo.sp_ThanhToan_Create
    @MaPhieuDatCho     = 1,
    @MaVe              = 1,
    @HinhThucThanhToan = 'TIEN_MAT',
    @SoTienThanhToan   = 550000,
    @MaThanhToan       = @MaTT3 OUTPUT;

IF @MaTT3 IS NOT NULL
    RAISERROR(N'FAIL [sp_ThanhToan_Create] Both params: should return error', 16, 1);

PRINT N'PASS [sp_ThanhToan_Create] Both MaPhieuDatCho and MaVe returns error';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== sp_ThanhToan_Create: all tests passed ===';
GO
