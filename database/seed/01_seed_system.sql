USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: System (VAITRO, THAM_SO, TAIKHOAN) ===';
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

-- ─── THAM_SO ─────────────────────────────────────────────────────────────────
MERGE dbo.THAM_SO AS target
USING (VALUES
    ('TuoiMuaVeToiThieu',        '18',    N'Tuổi tối thiểu để mua vé (năm)'),
    ('ThoiGianBayToiThieu',      '30',    N'Thời gian bay tối thiểu (phút)'),
    ('SoSanBayTrungGianToiDa',   '2',     N'Số sân bay trung gian tối đa mỗi chuyến bay'),
    ('ThoiGianDungToiThieu',     '45',    N'Thời gian dừng tối thiểu tại sân bay TG (phút)'),
    ('ThoiGianDungToiDa',        '120',   N'Thời gian dừng tối đa tại sân bay TG (phút)'),
    ('ThoiGianDongBanVe',        '45',    N'Phút trước giờ bay đóng bán vé tại quầy'),
    ('TGDatVeChamNhat',          '120',   N'Phút trước giờ bay để đặt vé qua app/web'),
    ('TGHuyChamNhat',            '0',     N'Phút trước giờ bay được phép hủy vé (0 = đến tận giờ bay)'),
    ('ThoiGianChoPhepDoiVe',     '24',    N'Giờ trước giờ bay được phép đổi chuyến'),
    ('ThueVAT',                  '10',    N'% thuế VAT áp dụng lên tổng thanh toán'),
    ('ThoiHanThanhToan',         '2',     N'Giờ thời hạn thanh toán sau khi đặt chỗ'),
    ('TrongLuongToiDaMotKien',   '32',    N'Trọng lượng tối đa một kiện hành lý (kg)'),
    ('SoKienToiDa',              '15',    N'Số kiện hành lý tối đa trong một gói'),
    ('ThoiGianMuaHanhLyUuDai',   '3',     N'Giờ trước giờ bay để được giá mua hành lý ưu đãi'),
    ('ThoiGianMoCheckInOnline',  '24',    N'Giờ trước giờ bay mở check-in online'),
    ('ThoiGianDongCheckInOnline','60',    N'Phút trước giờ bay đóng check-in online'),
    ('ACCESS_TOKEN_MINUTES',     '30',    N'Số phút access token JWT còn hiệu lực'),
    ('REFRESH_TOKEN_EXPIRY_DAYS','7',     N'Số ngày refresh token còn hiệu lực')
) AS src(TenThamSo, GiaTri, MoTa)
ON target.TenThamSo = src.TenThamSo
WHEN NOT MATCHED THEN
    INSERT (TenThamSo, GiaTri, MoTa) VALUES (src.TenThamSo, src.GiaTri, src.MoTa)
WHEN MATCHED AND target.GiaTri <> src.GiaTri THEN
    UPDATE SET GiaTri = src.GiaTri, MoTa = src.MoTa;
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
