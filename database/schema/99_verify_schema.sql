USE [$(DB_NAME)];
GO

SET NOCOUNT ON;

DECLARE @ExpectedTables TABLE (TableName SYSNAME PRIMARY KEY);
INSERT INTO @ExpectedTables (TableName)
VALUES
    (N'VAITRO'),
    (N'TAIKHOAN'),
    (N'REFRESH_TOKEN'),
    (N'AUDIT_LOG'),
    (N'APP_CONFIG'),
    (N'HANGTHANHVIEN'),
    (N'KHACHHANG'),
    (N'SANBAY'),
    (N'HANGVE'),
    (N'CHUYENBAY'),
    (N'TRUNGGIAN'),
    (N'CT_HANGVE'),
    (N'PHIEUDATCHO'),
    (N'VE'),
    (N'THANHTOAN'),
    (N'BANGGIA_HANHLY'),
    (N'GOIHANHLY'),
    (N'KIENHANHLY'),
    (N'CHECKIN');

IF EXISTS (
    SELECT 1
    FROM @ExpectedTables expected
    WHERE OBJECT_ID(N'dbo.' + expected.TableName, N'U') IS NULL
)
BEGIN
    THROW 51000, 'Schema verification failed: one or more required tables are missing.', 1;
END;

DECLARE @ExpectedCheckInColumns TABLE (ColumnName SYSNAME PRIMARY KEY);
INSERT INTO @ExpectedCheckInColumns (ColumnName)
VALUES
    (N'MaCheckIn'),
    (N'MaVe'),
    (N'SoGhe'),
    (N'BoardingPassCode'),
    (N'CheckInAt'),
    (N'TrangThai'),
    (N'CreatedAt');

IF EXISTS (
    SELECT 1
    FROM @ExpectedCheckInColumns expected
    WHERE COL_LENGTH(N'dbo.CHECKIN', expected.ColumnName) IS NULL
)
BEGIN
    THROW 51001, 'Schema verification failed: CHECKIN columns are incomplete.', 1;
END;

DECLARE @ExpectedConstraints TABLE (ConstraintName SYSNAME PRIMARY KEY);
INSERT INTO @ExpectedConstraints (ConstraintName)
VALUES
    (N'FK_TAIKHOAN_KHACHHANG'),
    (N'CK_CHUYENBAY_SanBay'),
    (N'CK_CHUYENBAY_ThoiGian'),
    (N'CK_CTHANGVE_SoLuong'),
    (N'CK_KIEN_TrongLuong');

IF EXISTS (
    SELECT 1
    FROM @ExpectedConstraints expected
    WHERE NOT EXISTS (
        SELECT 1
        FROM sys.objects actual
        WHERE actual.name = expected.ConstraintName
          AND actual.type IN (N'F', N'C')
    )
)
BEGIN
    THROW 51002, 'Schema verification failed: one or more required constraints are missing.', 1;
END;

DECLARE @ExpectedIndexes TABLE (TableName SYSNAME, IndexName SYSNAME, PRIMARY KEY (TableName, IndexName));
INSERT INTO @ExpectedIndexes (TableName, IndexName)
VALUES
    (N'CHUYENBAY', N'IX_CHUYENBAY_SanBayDi'),
    (N'CHUYENBAY', N'IX_CHUYENBAY_SanBayDen'),
    (N'CHUYENBAY', N'IX_CHUYENBAY_NgayGioBay'),
    (N'VE', N'IX_VE_MaChuyenBay'),
    (N'VE', N'IX_VE_MaKhachHang'),
    (N'VE', N'IX_VE_TrangThaiVe');

IF EXISTS (
    SELECT 1
    FROM @ExpectedIndexes expected
    WHERE NOT EXISTS (
        SELECT 1
        FROM sys.indexes actual
        WHERE actual.object_id = OBJECT_ID(N'dbo.' + expected.TableName)
          AND actual.name = expected.IndexName
    )
)
BEGIN
    THROW 51003, 'Schema verification failed: one or more required indexes are missing.', 1;
END;

PRINT 'Schema verification passed: 19 tables, CHECKIN columns, required constraints and indexes found.';
GO
