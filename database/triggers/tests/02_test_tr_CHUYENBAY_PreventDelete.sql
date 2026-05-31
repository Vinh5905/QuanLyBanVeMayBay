USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: tr_CHUYENBAY_PreventDelete ===';
GO

-- Test 1: DELETE a flight with no tickets → soft delete (IsDeleted=1)
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD1', N'PreventDelete Airport 1', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD2', N'PreventDelete Airport 2', N'City', N'VN');

DECLARE @NgayBay1 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('PD0001', 'PD1', 'PD2', @NgayBay1, 90, 300000);
DECLARE @MaCB1 INT = SCOPE_IDENTITY();

-- Delete with no tickets → trigger should soft-delete
DELETE FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB1;

-- Row must still exist (soft deleted)
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB1 AND IsDeleted = 1)
    RAISERROR(N'FAIL [tr_CHUYENBAY_PreventDelete] Soft delete: row should exist with IsDeleted=1', 16, 1);

-- Row must not be visible as active
IF EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB1 AND IsDeleted = 0)
    RAISERROR(N'FAIL [tr_CHUYENBAY_PreventDelete] Soft delete: row should not be active', 16, 1);

PRINT N'PASS [tr_CHUYENBAY_PreventDelete] No tickets → soft delete';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: DELETE a flight that has an active VE → RAISERROR, flight unchanged
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD3', N'PreventDelete Airport 3', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD4', N'PreventDelete Airport 4', N'City', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_PD_T2');
DECLARE @MaKH2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HANGVE_PD2', 1.0);
DECLARE @MaHV2 INT = SCOPE_IDENTITY();

DECLARE @NgayBay2 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('PD0002', 'PD3', 'PD4', @NgayBay2, 90, 300000);
DECLARE @MaCB2 INT = SCOPE_IDENTITY();

-- Insert an active ticket for this flight
INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
VALUES ('VEPD2_' + CAST(@@SPID AS VARCHAR), @MaCB2, @MaHV2, @MaKH2, 300000, 'HOP_LE');

-- Attempt to delete the flight → should be prevented
BEGIN TRY
    DELETE FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB2;
    RAISERROR(N'FAIL [tr_CHUYENBAY_PreventDelete] Delete with tickets: should have raised error', 16, 1);
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 50000 AND ERROR_MESSAGE() LIKE N'%Không thể xóa%'
        PRINT N'PASS [tr_CHUYENBAY_PreventDelete] Active VE → delete correctly prevented';
    ELSE
    BEGIN
        DECLARE @ErrMsg2 NVARCHAR(500) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg2, 16, 1);
    END;
END CATCH;

-- Flight must still be active (unchanged)
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB2 AND IsDeleted = 0)
    RAISERROR(N'FAIL [tr_CHUYENBAY_PreventDelete] Flight should remain active after blocked delete', 16, 1);

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: DELETE a flight with an active PHIEUDATCHO → also prevented
BEGIN TRAN;

INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD5', N'PreventDelete Airport 5', N'City', N'VN');
INSERT INTO dbo.SANBAY (MaSanBay, TenSanBay, ThanhPho, QuocGia)
VALUES ('PD6', N'PreventDelete Airport 6', N'City', N'VN');

INSERT INTO dbo.KHACHHANG (HoTen) VALUES (N'KH_PD_T3');
DECLARE @MaKH3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.HANGVE (TenHangVe, HeSoGia) VALUES (N'HANGVE_PD3', 1.0);
DECLARE @MaHV3 INT = SCOPE_IDENTITY();

DECLARE @NgayBay3 DATETIME2(0) = DATEADD(HOUR, 48, SYSUTCDATETIME());
INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan)
VALUES ('PD0003', 'PD5', 'PD6', @NgayBay3, 90, 300000);
DECLARE @MaCB3 INT = SCOPE_IDENTITY();

-- Insert an active reservation (no ticket yet)
INSERT INTO dbo.PHIEUDATCHO
    (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
VALUES (@MaKH3, @MaCB3, @MaHV3, 1, 300000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));

BEGIN TRY
    DELETE FROM dbo.CHUYENBAY WHERE MaChuyenBay = @MaCB3;
    RAISERROR(N'FAIL [tr_CHUYENBAY_PreventDelete] Delete with PHIEUDATCHO: should have raised error', 16, 1);
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 50000 AND ERROR_MESSAGE() LIKE N'%Không thể xóa%'
        PRINT N'PASS [tr_CHUYENBAY_PreventDelete] Active PHIEUDATCHO → delete correctly prevented';
    ELSE
    BEGIN
        DECLARE @ErrMsg3 NVARCHAR(500) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg3, 16, 1);
    END;
END CATCH;

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== tr_CHUYENBAY_PreventDelete: all tests passed ===';
GO
