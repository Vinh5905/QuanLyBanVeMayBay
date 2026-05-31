USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Baggage (BANGGIA_HANHLY, GOIHANHLY, KIENHANHLY) ===';
GO

-- ─── BANGGIA_HANHLY ───────────────────────────────────────────────────────────
MERGE dbo.BANGGIA_HANHLY AS target
USING (VALUES
    (N'20kg', 20.00, 300000, 500000, 1),
    (N'25kg', 25.00, 400000, 650000, 1),
    (N'30kg', 30.00, 500000, 800000, 1)
) AS src(TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay, IsActive)
ON target.TenGoi = src.TenGoi
WHEN NOT MATCHED THEN
    INSERT (TenGoi, TrongLuongToiDa, GiaMuaTruoc, GiaTaiSanBay, IsActive)
    VALUES (src.TenGoi, src.TrongLuongToiDa, src.GiaMuaTruoc, src.GiaTaiSanBay, src.IsActive)
WHEN MATCHED THEN
    UPDATE SET TrongLuongToiDa = src.TrongLuongToiDa,
               GiaMuaTruoc     = src.GiaMuaTruoc,
               GiaTaiSanBay    = src.GiaTaiSanBay,
               IsActive        = src.IsActive;
GO

-- ─── GOIHANHLY + KIENHANHLY ───────────────────────────────────────────────────

-- VE-001: 20kg pre-bought, 1 piece at 18.5 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-001')
BEGIN
    DECLARE @V001 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-001');
    DECLARE @BG20 INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'20kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V001, @BG20, 18.5, 300000, 'REGISTERED');
    DECLARE @Goi001 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-001')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi001, 'SEED-BAG-001', 18.5, N'Túi du lịch');
END;
GO

-- VE-003: 30kg pre-bought (Business), 2 pieces: 12 kg + 14 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-003')
BEGIN
    DECLARE @V003 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-003');
    DECLARE @BG30 INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'30kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V003, @BG30, 26, 500000, 'REGISTERED');
    DECLARE @Goi003 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-003A')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi003, 'SEED-BAG-003A', 12, N'Vali lớn');
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-003B')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi003, 'SEED-BAG-003B', 14, N'Túi thể thao');
END;
GO

-- VE-004: 20kg pre-bought, 1 piece at 19 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-004')
BEGIN
    DECLARE @V004 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-004');
    DECLARE @BG20b INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'20kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V004, @BG20b, 19, 300000, 'REGISTERED');
    DECLARE @Goi004 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-004')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi004, 'SEED-BAG-004', 19, N'Vali kéo');
END;
GO

-- VE-007: 25kg pre-bought (Business), 1 piece at 23 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-007')
BEGIN
    DECLARE @V007 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-007');
    DECLARE @BG25 INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'25kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V007, @BG25, 23, 400000, 'REGISTERED');
    DECLARE @Goi007 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-007')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi007, 'SEED-BAG-007', 23, N'Vali cứng');
END;
GO

-- VE-010: 20kg pre-bought, 1 piece at 16 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-010')
BEGIN
    DECLARE @V010 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-010');
    DECLARE @BG20c INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'20kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V010, @BG20c, 16, 300000, 'REGISTERED');
    DECLARE @Goi010 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-010')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi010, 'SEED-BAG-010', 16, N'Túi hành lý');
END;
GO

-- VE-012: 30kg pre-bought (Business frequent flyer), 2 pieces: 15 kg + 14.5 kg
IF NOT EXISTS (SELECT 1 FROM dbo.GOIHANHLY g INNER JOIN dbo.VE v ON v.MaVe = g.MaVe WHERE v.MaVeCode = 'SEED-VE-012')
BEGIN
    DECLARE @V012 INT = (SELECT MaVe FROM dbo.VE WHERE MaVeCode = 'SEED-VE-012');
    DECLARE @BG30b INT = (SELECT MaBangGia FROM dbo.BANGGIA_HANHLY WHERE TenGoi = N'30kg');
    INSERT INTO dbo.GOIHANHLY (MaVe, MaBangGia, TongTrongLuong, TongPhi, TrangThai)
    VALUES (@V012, @BG30b, 29.5, 500000, 'REGISTERED');
    DECLARE @Goi012 INT = SCOPE_IDENTITY();
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-012A')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi012, 'SEED-BAG-012A', 15, N'Vali lớn');
    IF NOT EXISTS (SELECT 1 FROM dbo.KIENHANHLY WHERE MaTheHanhLy = 'SEED-BAG-012B')
        INSERT INTO dbo.KIENHANHLY (MaGoiHanhLy, MaTheHanhLy, TrongLuong, GhiChu)
        VALUES (@Goi012, 'SEED-BAG-012B', 14.5, N'Túi dụng cụ');
END;
GO

PRINT N'=== Baggage seed completed ===';
GO
