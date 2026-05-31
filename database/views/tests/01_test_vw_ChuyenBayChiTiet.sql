USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: vw_ChuyenBayChiTiet ===';
GO

-- Test 1: Flight with two seat classes appears with correct airport codes and seat stats
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('VT1', N'VT1 Airport', N'City A', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('VT2', N'VT2 Airport', N'City B', N'VN');

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'VT_Economy_' + CAST(@@SPID AS NVARCHAR), 1.0);
DECLARE @MaHV_Eco INT = SCOPE_IDENTITY();
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'VT_Business_' + CAST(@@SPID AS NVARCHAR), 1.5);
DECLARE @MaHV_Biz INT = SCOPE_IDENTITY();

DECLARE @NgayBay1 DATETIME2(0) = DATEADD(DAY, 7, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('VT001_' + CAST(@@SPID AS VARCHAR), 'VT1', 'VT2', @NgayBay1, 120, 500000);
DECLARE @MaCB1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB1, @MaHV_Eco, 100, 30, 500000);
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB1, @MaHV_Biz, 20, 5, 750000);

DECLARE @SanBayDi   VARCHAR(10), @SanBayDen   VARCHAR(10);
DECLARE @TongGheH1  INT,         @GheDaBanH1  INT,  @GheConH1  INT;
DECLARE @TongGheH2  INT,         @GheDaBanH2  INT,  @GheConH2  INT;

SELECT
    @SanBayDi  = SanBayDiCode,  @SanBayDen  = SanBayDenCode,
    @TongGheH1 = TongGheH1,     @GheDaBanH1 = GheDaBanH1,     @GheConH1  = GheConH1,
    @TongGheH2 = TongGheH2,     @GheDaBanH2 = GheDaBanH2,     @GheConH2  = GheConH2
FROM dbo.vw_ChuyenBayChiTiet
WHERE MaChuyenBay = @MaCB1;

IF @SanBayDi <> 'VT1' OR @SanBayDen <> 'VT2'
    RAISERROR(N'FAIL [vw_ChuyenBayChiTiet] Airport codes incorrect', 16, 1);
IF @TongGheH1 <> 100 OR @GheDaBanH1 <> 30 OR @GheConH1 <> 70
    RAISERROR(N'FAIL [vw_ChuyenBayChiTiet] H1 seat stats incorrect (Economy)', 16, 1);
IF @TongGheH2 <> 20 OR @GheDaBanH2 <> 5 OR @GheConH2 <> 15
    RAISERROR(N'FAIL [vw_ChuyenBayChiTiet] H2 seat stats incorrect (Business)', 16, 1);

PRINT N'PASS [vw_ChuyenBayChiTiet] Airport codes and seat stats correct';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: Soft-deleted flight does not appear in the view
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('VD1', N'VD1 Airport', N'City D', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('VD2', N'VD2 Airport', N'City E', N'VN');

DECLARE @NgayBayDel DATETIME2(0) = DATEADD(DAY, 7, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, IsDeleted)
VALUES ('VD001_' + CAST(@@SPID AS VARCHAR), 'VD1', 'VD2', @NgayBayDel, 90, 300000, 1);
DECLARE @MaCBDel INT = SCOPE_IDENTITY();

DECLARE @DelCount INT;
SELECT @DelCount = COUNT(*) FROM dbo.vw_ChuyenBayChiTiet WHERE MaChuyenBay = @MaCBDel;
IF @DelCount <> 0
    RAISERROR(N'FAIL [vw_ChuyenBayChiTiet] Soft-deleted flight must not appear', 16, 1);

PRINT N'PASS [vw_ChuyenBayChiTiet] Soft-deleted flight excluded';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== vw_ChuyenBayChiTiet: all tests passed ===';
GO
