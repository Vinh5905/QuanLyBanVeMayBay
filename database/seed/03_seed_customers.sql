USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Customers ===';
GO

-- ─── KHACHHANG ───────────────────────────────────────────────────────────────
-- KH01 — linked to user1 account (Vàng tier, 18500 points)
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'nguyen.van.an@example.com')
BEGIN
    DECLARE @HTV_Vang INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Vàng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Nguyễn Văn An', '001090012345', 'nguyen.van.an@example.com', '0912345678',
            '1990-03-15', @HTV_Vang, 18500);
END;
GO

-- KH02 — linked to user2 account (Bạc tier, 7200 points)
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'tran.thi.binh@example.com')
BEGIN
    DECLARE @HTV_Bac INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Bạc');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Trần Thị Bình', '079090012345', 'tran.thi.binh@example.com', '0987654321',
            '1995-07-22', @HTV_Bac, 7200);
END;
GO

-- KH03 — walk-in customer (Đồng tier)
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'le.van.cuong@example.com')
BEGIN
    DECLARE @HTV_Dong INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Lê Văn Cường', '048090012345', 'le.van.cuong@example.com', '0901234567',
            '1988-11-05', @HTV_Dong, 1500);
END;
GO

-- KH04
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'pham.thi.dung@example.com')
BEGIN
    DECLARE @HTV_Dong2 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Phạm Thị Dung', '025090012345', 'pham.thi.dung@example.com', '0936789012',
            '1992-02-28', @HTV_Dong2, 800);
END;
GO

-- KH05 — high-value frequent flyer (Bạch Kim tier)
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'hoang.minh.duc@example.com')
BEGIN
    DECLARE @HTV_BK INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Bạch Kim');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Hoàng Minh Đức', '024090012345', 'hoang.minh.duc@example.com', '0903456789',
            '1975-09-10', @HTV_BK, 42000);
END;
GO

-- KH06
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'do.thi.lan@example.com')
BEGIN
    DECLARE @HTV_Dong3 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Đỗ Thị Lan', '092090012345', 'do.thi.lan@example.com', '0919876543',
            '1993-05-18', @HTV_Dong3, 2100);
END;
GO

-- KH07 (Bạc tier)
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'nguyen.thanh.luan@example.com')
BEGIN
    DECLARE @HTV_Bac2 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Bạc');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Nguyễn Thành Luân', '083090012345', 'nguyen.thanh.luan@example.com', '0928765432',
            '1987-12-03', @HTV_Bac2, 6800);
END;
GO

-- KH08
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'vu.thi.my@example.com')
BEGIN
    DECLARE @HTV_Dong4 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Vũ Thị Mỹ', '040090012345', 'vu.thi.my@example.com', '0945678901',
            '1996-08-25', @HTV_Dong4, 1200);
END;
GO

-- KH09
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'truong.van.nam@example.com')
BEGIN
    DECLARE @HTV_Dong5 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Trương Văn Nam', '054090012345', 'truong.van.nam@example.com', '0956789012',
            '1983-04-14', @HTV_Dong5, 3400);
END;
GO

-- KH10
IF NOT EXISTS (SELECT 1 FROM dbo.KHACHHANG WHERE Email = 'bui.thi.oanh@example.com')
BEGIN
    DECLARE @HTV_Dong6 INT = (SELECT MaHangThanhVien FROM dbo.HANGTHANHVIEN WHERE TenHang = N'Đồng');
    INSERT INTO dbo.KHACHHANG (HoTen, CCCD, Email, SoDienThoai, NgaySinh, MaHangThanhVien, DiemTichLuy)
    VALUES (N'Bùi Thị Oanh', '077090012345', 'bui.thi.oanh@example.com', '0967890123',
            '1999-01-30', @HTV_Dong6, 500);
END;
GO

-- ─── Link TAIKHOAN → KHACHHANG ────────────────────────────────────────────────
UPDATE dbo.TAIKHOAN
SET MaKhachHang = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'nguyen.van.an@example.com')
WHERE TenDangNhap = 'user1' AND MaKhachHang IS NULL;

UPDATE dbo.TAIKHOAN
SET MaKhachHang = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'tran.thi.binh@example.com')
WHERE TenDangNhap = 'user2' AND MaKhachHang IS NULL;
GO

PRINT N'=== Customers seed completed ===';
GO
