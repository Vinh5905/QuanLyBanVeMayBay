USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Airports, Flight Classes, Membership Tiers ===';
GO

-- ─── SANBAY ───────────────────────────────────────────────────────────────────
MERGE dbo.SANBAY AS target
USING (VALUES
    ('SGN', N'Sân bay Quốc tế Tân Sơn Nhất',  N'TP. Hồ Chí Minh', N'Việt Nam', 1),
    ('HAN', N'Sân bay Quốc tế Nội Bài',        N'Hà Nội',           N'Việt Nam', 1),
    ('DAD', N'Sân bay Quốc tế Đà Nẵng',        N'Đà Nẵng',          N'Việt Nam', 1),
    ('CXR', N'Sân bay Quốc tế Cam Ranh',       N'Khánh Hòa',        N'Việt Nam', 1),
    ('PQC', N'Sân bay Quốc tế Phú Quốc',       N'Phú Quốc',         N'Việt Nam', 1),
    ('HPH', N'Sân bay Quốc tế Cát Bi',         N'Hải Phòng',        N'Việt Nam', 1),
    ('HUI', N'Sân bay Phú Bài',                N'Huế',              N'Việt Nam', 1),
    ('VCA', N'Sân bay Quốc tế Cần Thơ',        N'Cần Thơ',          N'Việt Nam', 1),
    ('VDH', N'Sân bay Đồng Hới',               N'Quảng Bình',       N'Việt Nam', 1),
    ('BMV', N'Sân bay Buôn Ma Thuột',           N'Đắk Lắk',          N'Việt Nam', 1)
) AS src(MaSanBay, TenSanBay, ThanhPho, QuocGia, IsActive)
ON target.MaSanBay = src.MaSanBay
WHEN NOT MATCHED THEN
    INSERT (MaSanBay, TenSanBay, ThanhPho, QuocGia, IsActive)
    VALUES (src.MaSanBay, src.TenSanBay, src.ThanhPho, src.QuocGia, src.IsActive)
WHEN MATCHED THEN
    UPDATE SET TenSanBay = src.TenSanBay, ThanhPho = src.ThanhPho,
               QuocGia = src.QuocGia, IsActive = src.IsActive;
GO

-- ─── HANGVE ───────────────────────────────────────────────────────────────────
MERGE dbo.HANGVE AS target
USING (VALUES
    (N'Phổ Thông',  1.00, N'Hạng phổ thông tiêu chuẩn',  1),
    (N'Thương Gia', 2.50, N'Hạng thương gia cao cấp',     1),
    (N'Hạng Nhất',  5.00, N'Hạng nhất sang trọng',        1)
) AS src(TenHangVe, HeSoGia, MoTa, IsActive)
ON target.TenHangVe = src.TenHangVe
WHEN NOT MATCHED THEN
    INSERT (TenHangVe, HeSoGia, MoTa, IsActive)
    VALUES (src.TenHangVe, src.HeSoGia, src.MoTa, src.IsActive)
WHEN MATCHED THEN
    UPDATE SET HeSoGia = src.HeSoGia, MoTa = src.MoTa, IsActive = src.IsActive;
GO

-- ─── HANGTHANHVIEN ───────────────────────────────────────────────────────────
MERGE dbo.HANGTHANHVIEN AS target
USING (VALUES
    (N'Đồng',     0,     0.00),
    (N'Bạc',      5000,  5.00),
    (N'Vàng',     15000, 10.00),
    (N'Bạch Kim', 30000, 20.00)
) AS src(TenHang, DiemToiThieu, TyLeGiamGia)
ON target.TenHang = src.TenHang
WHEN NOT MATCHED THEN
    INSERT (TenHang, DiemToiThieu, TyLeGiamGia)
    VALUES (src.TenHang, src.DiemToiThieu, src.TyLeGiamGia)
WHEN MATCHED THEN
    UPDATE SET DiemToiThieu = src.DiemToiThieu, TyLeGiamGia = src.TyLeGiamGia;
GO

PRINT N'=== Airports seed completed ===';
GO
