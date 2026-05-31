USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: fn_TinhPhiHangLy ===';
GO

-- Test 1 & 2: Early purchase → GiaMuaTruoc; late purchase → GiaTaiSanBay
-- Flight departs in 5h; cutoff is 3h before departure = now+2h
-- Early: ThoiDiemMua = now        (now < now+2h) → GiaMuaTruoc = 200000
-- Late:  ThoiDiemMua = now+4h     (now+4h > now+2h) → GiaTaiSanBay = 350000
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL1', N'FHL1 Airport', N'City A', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL2', N'FHL2 Airport', N'City B', N'VN');

DECLARE @NgayBay DATETIME2(0) = DATEADD(HOUR, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('FHL_' + CAST(@@SPID AS VARCHAR), 'FHL1', 'FHL2', @NgayBay, 90, 300000);
DECLARE @MaCB INT = SCOPE_IDENTITY();

INSERT INTO dbo.BANGGIA_HANHLY (TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay)
VALUES (N'FHL_Tier_' + CAST(@@SPID AS NVARCHAR), 40.0, 200000, 350000);

DECLARE @PhiEarly DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(35.0, SYSUTCDATETIME(), @MaCB);
IF @PhiEarly <> 200000
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] Early purchase should return GiaMuaTruoc (200000)', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] Early purchase returns GiaMuaTruoc';

DECLARE @PhiLate DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(35.0, DATEADD(HOUR, 4, SYSUTCDATETIME()), @MaCB);
IF @PhiLate <> 350000
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] Late purchase should return GiaTaiSanBay (350000)', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] Late purchase returns GiaTaiSanBay';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: Weight exceeds all active tiers → NULL
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL3', N'FHL3 Airport', N'City C', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL4', N'FHL4 Airport', N'City D', N'VN');

DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('FHL3_' + CAST(@@SPID AS VARCHAR), 'FHL3', 'FHL4', @NgayBay3, 90, 300000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();

-- No active tier covers 9999 kg
DECLARE @PhiBig DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(9999.0, SYSUTCDATETIME(), @MaCB3);
IF @PhiBig IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] Weight exceeds all tiers should return NULL', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] Weight exceeds all active tiers returns NULL';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 4: Only inactive tier available → NULL (IsActive=0 excluded)
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL5', N'FHL5 Airport', N'City E', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('FHL6', N'FHL6 Airport', N'City F', N'VN');

DECLARE @NgayBay4 DATETIME2(0) = DATEADD(HOUR, 5, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('FHL4_' + CAST(@@SPID AS VARCHAR), 'FHL5', 'FHL6', @NgayBay4, 90, 300000);
DECLARE @MaCB4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.BANGGIA_HANHLY (TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay, IsActive)
VALUES (N'FHL_Inactive_' + CAST(@@SPID AS NVARCHAR), 50.0, 200000, 350000, 0);

DECLARE @PhiInactive DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(45.0, SYSUTCDATETIME(), @MaCB4);
IF @PhiInactive IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] IsActive=0 tier should be excluded → NULL', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] Inactive tier excluded';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 5: Invalid MaChuyenBay → NULL
DECLARE @PhiNoFlight DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(20.0, SYSUTCDATETIME(), -999);
IF @PhiNoFlight IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] Invalid MaChuyenBay should return NULL', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] Invalid MaChuyenBay returns NULL';
GO

-- Test 6: NULL input returns NULL (RETURNS NULL ON NULL INPUT)
DECLARE @PhiNull DECIMAL(18,2) = dbo.fn_TinhPhiHangLy(NULL, SYSUTCDATETIME(), 1);
IF @PhiNull IS NOT NULL
    RAISERROR(N'FAIL [fn_TinhPhiHangLy] NULL TongTrongLuong should return NULL', 16, 1);
PRINT N'PASS [fn_TinhPhiHangLy] NULL input returns NULL';
GO

PRINT N'=== fn_TinhPhiHangLy: all tests passed ===';
GO
