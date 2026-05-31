USE [$(DB_NAME)];
GO

PRINT N'=== TEST: sp_DatVe_Create ===';
GO

-- Test 1: Happy path — creates PHIEUDATCHO + VE (DANG_GIU_CHO), increments seat
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DatVe 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DV1', N'DatVe A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DV2', N'DatVe B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'DV_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 10, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DVC001', 'DV1', 'DV2', @NgayBay, 90, 600000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 600000);

DECLARE @MaPhieuDat INT;
EXEC dbo.sp_DatVe_Create
    @MaChuyenBay = @MaCB,
    @MaKhachHang = @MaKH,
    @MaHangVe    = @MaHV,
    @MaPhieuDat  = @MaPhieuDat OUTPUT;

IF @MaPhieuDat IS NULL OR @MaPhieuDat <= 0
    RAISERROR(N'FAIL [sp_DatVe_Create] Happy path: MaPhieuDat should be > 0', 16, 1);

-- PHIEUDATCHO should be DANG_GIU_CHO
DECLARE @TrangThaiPDC VARCHAR(30);
SELECT @TrangThaiPDC = TrangThaiDatCho
FROM dbo.PHIEUDATCHO WHERE MaPhieuDatCho = @MaPhieuDat;
IF @TrangThaiPDC <> 'DANG_GIU_CHO'
    RAISERROR(N'FAIL [sp_DatVe_Create] PHIEUDATCHO status should be DANG_GIU_CHO', 16, 1);

-- VE should exist with DANG_GIU_CHO
DECLARE @TrangThaiVe VARCHAR(30);
SELECT @TrangThaiVe = TrangThaiVe
FROM dbo.VE WHERE MaPhieuDatCho = @MaPhieuDat;
IF @TrangThaiVe <> 'DANG_GIU_CHO'
    RAISERROR(N'FAIL [sp_DatVe_Create] VE status should be DANG_GIU_CHO', 16, 1);

-- Seat counter should be incremented
DECLARE @GheDaDat INT;
SELECT @GheDaDat = SoGheDaDat FROM dbo.CT_HANGVE
WHERE MaChuyenBay = @MaCB AND MaHangVe = @MaHV;
IF @GheDaDat <> 1
    RAISERROR(N'FAIL [sp_DatVe_Create] SoGheDaDat should be 1 after reservation', 16, 1);

PRINT N'PASS [sp_DatVe_Create] Happy path';

ROLLBACK;
GO

-- Test 2: Non-existent flight → error, no data inserted
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DatVe 2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

DECLARE @MaPhieuDat2 INT;
EXEC dbo.sp_DatVe_Create
    @MaChuyenBay = 999999,
    @MaKhachHang = @MaKH2,
    @MaHangVe    = 1,
    @MaPhieuDat  = @MaPhieuDat2 OUTPUT;

IF @MaPhieuDat2 IS NOT NULL
    RAISERROR(N'FAIL [sp_DatVe_Create] Non-existent flight: should not create booking', 16, 1);

PRINT N'PASS [sp_DatVe_Create] Non-existent flight returns error';

ROLLBACK;
GO

-- Test 3: No seats left → error
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH DatVe 3');
DECLARE @MaKH3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DV3', N'DatVe C', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('DV4', N'DatVe D', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'DV_FULL', 1.0);
DECLARE @MaHV3 INT = SCOPE_IDENTITY();

DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 10, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('DVC003', 'DV3', 'DV4', @NgayBay3, 90, 600000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB3, @MaHV3, 3, 3, 600000);  -- fully booked

DECLARE @MaPhieuDat3 INT;
EXEC dbo.sp_DatVe_Create
    @MaChuyenBay = @MaCB3,
    @MaKhachHang = @MaKH3,
    @MaHangVe    = @MaHV3,
    @MaPhieuDat  = @MaPhieuDat3 OUTPUT;

IF @MaPhieuDat3 IS NOT NULL
    RAISERROR(N'FAIL [sp_DatVe_Create] No seats: should not create booking', 16, 1);

PRINT N'PASS [sp_DatVe_Create] No seats available returns error';

ROLLBACK;
GO

PRINT N'=== sp_DatVe_Create: all tests passed ===';
GO
