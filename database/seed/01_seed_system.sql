USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: System (VAITRO, APP_CONFIG, TAIKHOAN) ===';
GO

-- ─── VAITRO ──────────────────────────────────────────────────────────────────
MERGE dbo.VAITRO AS target
USING (VALUES
    (N'Admin',      N'Quản trị viên hệ thống'),
    (N'NhanVien',   N'Nhân viên hãng hàng không'),
    (N'DaiLy',      N'Đại lý bán vé'),
    (N'KhachHang',  N'Khách hàng')
) AS src(TenVaiTro, MoTa)
ON target.TenVaiTro = src.TenVaiTro
WHEN NOT MATCHED THEN
    INSERT (TenVaiTro, MoTa) VALUES (src.TenVaiTro, src.MoTa);
GO

-- ─── APP_CONFIG ───────────────────────────────────────────────────────────────
MERGE dbo.APP_CONFIG AS target
USING (VALUES
    ('THOI_GIAN_DONG_BAN_VE',        '24',     N'Giờ trước giờ bay đóng bán vé'),
    ('THOI_HAN_THANH_TOAN',          '2',      N'Giờ thời hạn thanh toán giữ chỗ'),
    ('THUE_VAT',                     '10',     N'% thuế VAT áp dụng'),
    ('PHI_HUY_VE',                   '100000', N'Phí hủy vé (VNĐ)'),
    ('PHI_DOI_VE',                   '200000', N'Phí đổi chuyến (VNĐ)'),
    ('THOI_GIAN_MO_CHECKIN',         '24',     N'Giờ trước giờ bay mở check-in'),
    ('THOI_GIAN_DONG_CHECKIN',       '60',     N'Phút trước giờ bay đóng check-in'),
    ('THOI_GIAN_MUA_TRUOC_HANHLY',   '3',      N'Giờ trước giờ bay để dùng giá mua trước hành lý'),
    ('REFRESH_TOKEN_EXPIRY_DAYS',    '7',      N'Số ngày refresh token còn hiệu lực'),
    ('ACCESS_TOKEN_MINUTES',         '30',     N'Số phút access token còn hiệu lực'),
    ('DIEM_TICH_LUY_PER_100K',       '50',     N'Điểm tích lũy cộng thêm cho mỗi 100.000 VNĐ chi tiêu'),
    ('PHI_HANH_LY_KG_VUOT',         '50000',  N'Phí hành lý vượt ký (VNĐ/kg)'),
    ('GIA_VE_TOI_THIEU',             '100000', N'Giá vé tối thiểu (VNĐ)')
) AS src(ConfigKey, ConfigValue, MoTa)
ON target.ConfigKey = src.ConfigKey
WHEN NOT MATCHED THEN
    INSERT (ConfigKey, ConfigValue, MoTa) VALUES (src.ConfigKey, src.ConfigValue, src.MoTa)
WHEN MATCHED AND target.ConfigValue <> src.ConfigValue THEN
    UPDATE SET ConfigValue = src.ConfigValue, MoTa = src.MoTa;
GO

-- ─── TAIKHOAN ────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE TenDangNhap = 'admin')
BEGIN
    DECLARE @MaVT_Admin INT = (SELECT MaVaiTro FROM dbo.VAITRO WHERE TenVaiTro = N'Admin');
    INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai)
    VALUES ('admin', '$2b$10$oGksCtG5X/a0nl8r68BQk.cm9gbws24VV2nJypV5kJPxxlkZwWg7W',
            @MaVT_Admin, 'admin@airline.vn', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE TenDangNhap = 'staff')
BEGIN
    DECLARE @MaVT_NV INT = (SELECT MaVaiTro FROM dbo.VAITRO WHERE TenVaiTro = N'NhanVien');
    INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai)
    VALUES ('staff', '$2b$10$ICSCkPViy.QyuHZBTBkMEeq179FIaBO10HwvrLf2EBX6t.LMWPEJS',
            @MaVT_NV, 'staff@airline.vn', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE TenDangNhap = 'agent')
BEGIN
    DECLARE @MaVT_DL INT = (SELECT MaVaiTro FROM dbo.VAITRO WHERE TenVaiTro = N'DaiLy');
    INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai)
    VALUES ('agent', '$2b$10$CqrezJEjtevwSv8m.jsgfONYjTebKVk2.eWpOVQX5vOg8qm9elW3W',
            @MaVT_DL, 'agent@airline.vn', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE TenDangNhap = 'user1')
BEGIN
    DECLARE @MaVT_KH1 INT = (SELECT MaVaiTro FROM dbo.VAITRO WHERE TenVaiTro = N'KhachHang');
    INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai)
    VALUES ('user1', '$2b$10$fGKJESrDGnAVYb6PdFB33u4lVfMg65qx0Ii68aYDE7boxjrwkRNvG',
            @MaVT_KH1, 'user1@example.com', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE TenDangNhap = 'user2')
BEGIN
    DECLARE @MaVT_KH2 INT = (SELECT MaVaiTro FROM dbo.VAITRO WHERE TenVaiTro = N'KhachHang');
    INSERT INTO dbo.TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai)
    VALUES ('user2', '$2b$10$fGKJESrDGnAVYb6PdFB33u4lVfMg65qx0Ii68aYDE7boxjrwkRNvG',
            @MaVT_KH2, 'user2@example.com', 1);
END;
GO

PRINT N'=== System seed completed ===';
GO
