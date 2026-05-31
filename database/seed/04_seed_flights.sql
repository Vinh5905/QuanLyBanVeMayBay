USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Flights (CHUYENBAY, TRUNGGIAN, CT_HANGVE) ===';
GO

-- ─── CHUYENBAY — Near-future (5 flights) ─────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-001')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-001', 'SGN', 'HAN', DATEADD(HOUR, 2, SYSUTCDATETIME()), 120, 1200000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-002')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-002', 'SGN', 'DAD', DATEADD(HOUR, 6, SYSUTCDATETIME()), 80, 800000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-003')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-003', 'HAN', 'DAD', DATEADD(HOUR, 12, SYSUTCDATETIME()), 90, 900000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-004')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-004', 'SGN', 'PQC', DATEADD(HOUR, 36, SYSUTCDATETIME()), 65, 650000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-005')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-005', 'HAN', 'CXR', DATEADD(HOUR, 48, SYSUTCDATETIME()), 100, 1000000, 'SCHEDULED');
GO

-- ─── CHUYENBAY — Next week (10 flights) ──────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-006')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-006', 'SGN', 'HAN', DATEADD(DAY, 7, SYSUTCDATETIME()), 120, 1100000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-007')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-007', 'HAN', 'SGN', DATEADD(HOUR, 172, SYSUTCDATETIME()), 120, 1100000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-008')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-008', 'SGN', 'DAD', DATEADD(DAY, 8, SYSUTCDATETIME()), 80, 750000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-009')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-009', 'DAD', 'SGN', DATEADD(HOUR, 198, SYSUTCDATETIME()), 80, 750000, 'SCHEDULED');

-- CB-010: SGN→HPH với trung gian tại HAN
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-010')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-010', 'SGN', 'HPH', DATEADD(DAY, 9, SYSUTCDATETIME()), 240, 1050000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-011')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-011', 'HAN', 'PQC', DATEADD(HOUR, 220, SYSUTCDATETIME()), 90, 900000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-012')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-012', 'SGN', 'HUI', DATEADD(DAY, 10, SYSUTCDATETIME()), 70, 700000, 'SCHEDULED');

-- CB-013: HAN→CXR với trung gian tại DAD
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-013')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-013', 'HAN', 'CXR', DATEADD(HOUR, 248, SYSUTCDATETIME()), 195, 980000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-014')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-014', 'SGN', 'BMV', DATEADD(DAY, 11, SYSUTCDATETIME()), 75, 750000, 'SCHEDULED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-015')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-015', 'DAD', 'HAN', DATEADD(DAY, 12, SYSUTCDATETIME()), 90, 880000, 'SCHEDULED');
GO

-- ─── CHUYENBAY — Cancelled (3 flights) ───────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-016')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-016', 'SGN', 'HAN', DATEADD(HOUR, 26, SYSUTCDATETIME()), 120, 1200000, 'CANCELLED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-017')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-017', 'DAD', 'SGN', DATEADD(HOUR, 50, SYSUTCDATETIME()), 80, 800000, 'CANCELLED');

IF NOT EXISTS (SELECT 1 FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-018')
    INSERT INTO dbo.CHUYENBAY (MaChuyenBayCode, SanBayDi, SanBayDen, NgayGioBay, ThoiGianBay, GiaCoBan, TrangThaiChuyenBay)
    VALUES ('SEED-CB-018', 'HAN', 'HPH', DATEADD(HOUR, 74, SYSUTCDATETIME()), 60, 550000, 'CANCELLED');
GO

-- ─── TRUNGGIAN ───────────────────────────────────────────────────────────────
-- CB-010: SGN→HPH dừng tại HAN
DECLARE @MaCB010 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-010');
IF NOT EXISTS (SELECT 1 FROM dbo.TRUNGGIAN WHERE MaChuyenBay = @MaCB010 AND ThuTu = 1)
    INSERT INTO dbo.TRUNGGIAN (MaChuyenBay, MaSanBay, ThuTu, ThoiGianDung, GhiChu)
    VALUES (@MaCB010, 'HAN', 1, 60, N'Dừng kỹ thuật tại Nội Bài');
GO

-- CB-013: HAN→CXR dừng tại DAD
DECLARE @MaCB013 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-013');
IF NOT EXISTS (SELECT 1 FROM dbo.TRUNGGIAN WHERE MaChuyenBay = @MaCB013 AND ThuTu = 1)
    INSERT INTO dbo.TRUNGGIAN (MaChuyenBay, MaSanBay, ThuTu, ThoiGianDung, GhiChu)
    VALUES (@MaCB013, 'DAD', 1, 45, N'Dừng kỹ thuật tại Đà Nẵng');
GO

-- ─── CT_HANGVE — All SEED flights × All classes ───────────────────────────────
-- SoLuong: Economy=120, Business=30, Hạng Nhất=10
-- DonGia: GiaCoBan × HeSoGia
INSERT INTO dbo.CT_HANGVE (MaChuyenBay, MaHangVe, SoLuong, SoGheDaDat, DonGia)
SELECT
    cb.MaChuyenBay,
    hv.MaHangVe,
    CASE hv.TenHangVe
        WHEN N'Phổ Thông' THEN 120
        WHEN N'Thương Gia' THEN 30
        ELSE 10
    END AS SoLuong,
    0 AS SoGheDaDat,
    CAST(cb.GiaCoBan * hv.HeSoGia AS DECIMAL(18,2)) AS DonGia
FROM dbo.CHUYENBAY cb
CROSS JOIN dbo.HANGVE hv
WHERE cb.MaChuyenBayCode LIKE 'SEED-CB-%'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.CT_HANGVE cthv
      WHERE cthv.MaChuyenBay = cb.MaChuyenBay
        AND cthv.MaHangVe = hv.MaHangVe
  );
GO

PRINT N'=== Flights seed completed ===';
GO
