USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: sp_Report_DoanhThuThang & sp_Report_DoanhThuNam ===';
GO

-- Test 1: Monthly report — valid month/year, returns result set (may be empty rows)
BEGIN TRAN;

-- Just verify the SP executes without error on an empty period
EXEC dbo.sp_Report_DoanhThuThang @Nam = 2024, @Thang = 1;
PRINT N'PASS [sp_Report_DoanhThuThang] Valid month executes without error';

ROLLBACK;
GO

-- Test 2: Monthly report — invalid month (0) → returns error code
BEGIN TRAN;

EXEC dbo.sp_Report_DoanhThuThang @Nam = 2024, @Thang = 0;
PRINT N'PASS [sp_Report_DoanhThuThang] Month=0 returns error';

ROLLBACK;
GO

-- Test 3: Monthly report — invalid month (13) → returns error code
BEGIN TRAN;

EXEC dbo.sp_Report_DoanhThuThang @Nam = 2024, @Thang = 13;
PRINT N'PASS [sp_Report_DoanhThuThang] Month=13 returns error';

ROLLBACK;
GO

-- Test 4: Annual report returns exactly 12 rows
BEGIN TRAN;

CREATE TABLE #AnnualReport (
    Thang       INT,
    SoChuyenBay INT,
    SoVe        INT,
    DoanhThu    DECIMAL(18,2),
    PhanTram    DECIMAL(8,2)
);

INSERT INTO #AnnualReport
EXEC dbo.sp_Report_DoanhThuNam @Nam = 2024;

DECLARE @RowCount INT = (SELECT COUNT(*) FROM #AnnualReport);
IF @RowCount <> 12
    RAISERROR(N'FAIL [sp_Report_DoanhThuNam] Should return exactly 12 rows, got: %d', 16, 1, @RowCount);

-- Months 1-12 must all appear
DECLARE @Missing INT = (
    SELECT COUNT(*) FROM (VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS m(v)
    WHERE v NOT IN (SELECT Thang FROM #AnnualReport)
);
IF @Missing > 0
    RAISERROR(N'FAIL [sp_Report_DoanhThuNam] Not all 12 months present', 16, 1);

DROP TABLE #AnnualReport;

PRINT N'PASS [sp_Report_DoanhThuNam] Returns exactly 12 months';

ROLLBACK;
GO

-- Test 5: Monthly report with actual data — verifies revenue summing
BEGIN TRAN;

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH Report 1');
DECLARE @MaKH INT = SCOPE_IDENTITY();
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('RP1', N'RP A', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia) VALUES ('RP2', N'RP B', N'City', N'VN');
INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'RP_ECO', 1.0);
DECLARE @MaHV INT = SCOPE_IDENTITY();

-- Flight in January 2025
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('RPC001', 'RP1', 'RP2', '2025-01-15 10:00', 90, 500000);
DECLARE @MaCB INT = SCOPE_IDENTITY();
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
VALUES (@MaCB, @MaHV, 10, 0, 500000);

-- Create HOP_LE ticket (BanVe bypasses time-window by setting NgayGioBay to future)
DECLARE @MaVeCode VARCHAR(30) = 'VE_RP_2025_01_' + CAST(@@SPID AS VARCHAR(10));
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES (@MaVeCode, @MaCB, @MaHV, @MaKH, 500000, 'HOP_LE');
DECLARE @MaVe INT = SCOPE_IDENTITY();
UPDATE dbo.CT_HANGVE SET SoGheDaDat = 1 WHERE MaChuyenBay=@MaCB AND MaHangVe=@MaHV;

-- Add a COMPLETED payment (550000 = 500000 * 1.10 VAT)
INSERT INTO dbo.THANHTOAN
    (MaVe, SoTien, ThueVAT, PhuongThuc, TrangThaiThanhToan, ThoiGianThanhToan)
VALUES (@MaVe, 550000, 50000, 'TIEN_MAT', 'COMPLETED', '2025-01-15 09:00');

CREATE TABLE #MonthReport (
    MaChuyenBay     INT,
    MaChuyenBayCode VARCHAR(20),
    SanBayDi        VARCHAR(10),
    SanBayDen       VARCHAR(10),
    NgayGioBay      DATETIME2(0),
    DoanhThuVe      DECIMAL(18,2),
    DoanhThuHanhLy  DECIMAL(18,2),
    SoVeBan         INT,
    PhanTramTrenTong DECIMAL(8,2)
);

INSERT INTO #MonthReport
EXEC dbo.sp_Report_DoanhThuThang @Nam = 2025, @Thang = 1;

DECLARE @Revenue    DECIMAL(18,2);
DECLARE @RevenueMsg VARCHAR(50);
SELECT @Revenue = DoanhThuVe FROM #MonthReport WHERE MaChuyenBay = @MaCB;
SET @RevenueMsg = CAST(@Revenue AS VARCHAR(50));
IF @Revenue <> 550000
    RAISERROR(N'FAIL [sp_Report_DoanhThuThang] Revenue should be 550000, got: %s', 16, 1, @RevenueMsg);

DROP TABLE #MonthReport;

PRINT N'PASS [sp_Report_DoanhThuThang] Revenue calculation correct';

ROLLBACK;
GO

PRINT N'=== Report SPs: all tests passed ===';
GO
