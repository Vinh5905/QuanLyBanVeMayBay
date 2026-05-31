USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== SEED: Tickets (PHIEUDATCHO + VE) ===';
GO

-- ─── HOP_LE tickets (confirmed, paid) ────────────────────────────────────────

-- VE-001: CB001 (SGN→HAN +2h), Economy, KH01
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-001')
BEGIN
    DECLARE @CB001 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-001');
    DECLARE @HV_Eco INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH01 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'nguyen.van.an@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH01, @CB001, @HV_Eco, 1, 1200000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC001 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-001', @CB001, @HV_Eco, @KH01, @PDC001, 1200000, 'HOP_LE');
END;
GO

-- VE-002: CB001, Economy, KH02
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-002')
BEGIN
    DECLARE @CB001b INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-001');
    DECLARE @HV_Eco2 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH02 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'tran.thi.binh@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH02, @CB001b, @HV_Eco2, 1, 1200000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC002 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-002', @CB001b, @HV_Eco2, @KH02, @PDC002, 1200000, 'HOP_LE');
END;
GO

-- VE-003: CB001, Business, KH05
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-003')
BEGIN
    DECLARE @CB001c INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-001');
    DECLARE @HV_Bus INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Thương Gia');
    DECLARE @KH05 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'hoang.minh.duc@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH05, @CB001c, @HV_Bus, 1, 3000000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC003 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-003', @CB001c, @HV_Bus, @KH05, @PDC003, 3000000, 'HOP_LE');
END;
GO

-- VE-004: CB002 (SGN→DAD +6h), Economy, KH03
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-004')
BEGIN
    DECLARE @CB002 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-002');
    DECLARE @HV_Eco3 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH03 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'le.van.cuong@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH03, @CB002, @HV_Eco3, 1, 800000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC004 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-004', @CB002, @HV_Eco3, @KH03, @PDC004, 800000, 'HOP_LE');
END;
GO

-- VE-005: CB002, Economy, KH04
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-005')
BEGIN
    DECLARE @CB002b INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-002');
    DECLARE @HV_Eco4 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH04 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'pham.thi.dung@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH04, @CB002b, @HV_Eco4, 1, 800000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC005 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-005', @CB002b, @HV_Eco4, @KH04, @PDC005, 800000, 'HOP_LE');
END;
GO

-- VE-006: CB003 (HAN→DAD +12h), Economy, KH06
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-006')
BEGIN
    DECLARE @CB003 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-003');
    DECLARE @HV_Eco5 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH06 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'do.thi.lan@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH06, @CB003, @HV_Eco5, 1, 900000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC006 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-006', @CB003, @HV_Eco5, @KH06, @PDC006, 900000, 'HOP_LE');
END;
GO

-- VE-007: CB003, Business, KH07
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-007')
BEGIN
    DECLARE @CB003b INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-003');
    DECLARE @HV_Bus2 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Thương Gia');
    DECLARE @KH07 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'nguyen.thanh.luan@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH07, @CB003b, @HV_Bus2, 1, 2250000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC007 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-007', @CB003b, @HV_Bus2, @KH07, @PDC007, 2250000, 'HOP_LE');
END;
GO

-- VE-008: CB004 (SGN→PQC +36h), Economy, KH01
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-008')
BEGIN
    DECLARE @CB004 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-004');
    DECLARE @HV_Eco6 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH01b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'nguyen.van.an@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH01b, @CB004, @HV_Eco6, 1, 650000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC008 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-008', @CB004, @HV_Eco6, @KH01b, @PDC008, 650000, 'HOP_LE');
END;
GO

-- VE-009: CB005 (HAN→CXR +48h), Economy, KH02
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-009')
BEGIN
    DECLARE @CB005 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-005');
    DECLARE @HV_Eco7 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH02b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'tran.thi.binh@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH02b, @CB005, @HV_Eco7, 1, 1000000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC009 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-009', @CB005, @HV_Eco7, @KH02b, @PDC009, 1000000, 'HOP_LE');
END;
GO

-- VE-010: CB006 (SGN→HAN +7d), Economy, KH08
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-010')
BEGIN
    DECLARE @CB006 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-006');
    DECLARE @HV_Eco8 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH08 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'vu.thi.my@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH08, @CB006, @HV_Eco8, 1, 1100000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC010 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-010', @CB006, @HV_Eco8, @KH08, @PDC010, 1100000, 'HOP_LE');
END;
GO

-- VE-011: CB007 (HAN→SGN +7d+4h), Economy, KH09
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-011')
BEGIN
    DECLARE @CB007 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-007');
    DECLARE @HV_Eco9 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH09 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'truong.van.nam@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH09, @CB007, @HV_Eco9, 1, 1100000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC011 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-011', @CB007, @HV_Eco9, @KH09, @PDC011, 1100000, 'HOP_LE');
END;
GO

-- VE-012: CB008 (SGN→DAD +8d), Business, KH05
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-012')
BEGIN
    DECLARE @CB008 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-008');
    DECLARE @HV_Bus3 INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Thương Gia');
    DECLARE @KH05b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'hoang.minh.duc@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH05b, @CB008, @HV_Bus3, 1, 1875000, 'DA_THANH_TOAN', SYSUTCDATETIME());
    DECLARE @PDC012 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-012', @CB008, @HV_Bus3, @KH05b, @PDC012, 1875000, 'HOP_LE');
END;
GO

-- ─── DANG_GIU_CHO tickets (reserved, awaiting payment) ────────────────────────

-- VE-013: CB009 (DAD→SGN +8d+6h), Economy, KH03
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-013')
BEGIN
    DECLARE @CB009 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-009');
    DECLARE @HV_EcoA INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH03b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'le.van.cuong@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH03b, @CB009, @HV_EcoA, 1, 750000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));
    DECLARE @PDC013 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-013', @CB009, @HV_EcoA, @KH03b, @PDC013, 750000, 'DANG_GIU_CHO');
END;
GO

-- VE-014: CB010 (SGN→HPH +9d), Economy, KH04
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-014')
BEGIN
    DECLARE @CB010 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-010');
    DECLARE @HV_EcoB INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH04b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'pham.thi.dung@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH04b, @CB010, @HV_EcoB, 1, 1050000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));
    DECLARE @PDC014 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-014', @CB010, @HV_EcoB, @KH04b, @PDC014, 1050000, 'DANG_GIU_CHO');
END;
GO

-- VE-015: CB011 (HAN→PQC +9d+4h), Economy, KH06
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-015')
BEGIN
    DECLARE @CB011 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-011');
    DECLARE @HV_EcoC INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH06b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'do.thi.lan@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH06b, @CB011, @HV_EcoC, 1, 900000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));
    DECLARE @PDC015 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-015', @CB011, @HV_EcoC, @KH06b, @PDC015, 900000, 'DANG_GIU_CHO');
END;
GO

-- VE-016: CB012 (SGN→HUI +10d), Economy, KH07
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-016')
BEGIN
    DECLARE @CB012 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-012');
    DECLARE @HV_EcoD INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH07b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'nguyen.thanh.luan@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH07b, @CB012, @HV_EcoD, 1, 700000, 'DANG_GIU_CHO', DATEADD(HOUR, 2, SYSUTCDATETIME()));
    DECLARE @PDC016 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-016', @CB012, @HV_EcoD, @KH07b, @PDC016, 700000, 'DANG_GIU_CHO');
END;
GO

-- ─── DA_HUY tickets ────────────────────────────────────────────────────────────

-- VE-017: CB004, Economy, KH10 (passenger cancelled)
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-017')
BEGIN
    DECLARE @CB004c INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-004');
    DECLARE @HV_EcoE INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH10 INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'bui.thi.oanh@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH10, @CB004c, @HV_EcoE, 1, 650000, 'DA_HUY', SYSUTCDATETIME());
    DECLARE @PDC017 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-017', @CB004c, @HV_EcoE, @KH10, @PDC017, 650000, 'DA_HUY');
END;
GO

-- VE-018: CB005, Economy, KH09 (passenger cancelled)
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-018')
BEGIN
    DECLARE @CB005c INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-005');
    DECLARE @HV_EcoF INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH09b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'truong.van.nam@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH09b, @CB005c, @HV_EcoF, 1, 1000000, 'DA_HUY', SYSUTCDATETIME());
    DECLARE @PDC018 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-018', @CB005c, @HV_EcoF, @KH09b, @PDC018, 1000000, 'DA_HUY');
END;
GO

-- VE-019: CB016 (cancelled flight), Economy, KH08
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-019')
BEGIN
    DECLARE @CB016 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-016');
    DECLARE @HV_EcoG INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH08b INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'vu.thi.my@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH08b, @CB016, @HV_EcoG, 1, 1200000, 'DA_HUY', SYSUTCDATETIME());
    DECLARE @PDC019 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-019', @CB016, @HV_EcoG, @KH08b, @PDC019, 1200000, 'DA_HUY');
END;
GO

-- VE-020: CB017 (cancelled flight), Economy, KH03
IF NOT EXISTS (SELECT 1 FROM dbo.VE WHERE MaVeCode = 'SEED-VE-020')
BEGIN
    DECLARE @CB017 INT = (SELECT MaChuyenBay FROM dbo.CHUYENBAY WHERE MaChuyenBayCode = 'SEED-CB-017');
    DECLARE @HV_EcoH INT = (SELECT MaHangVe FROM dbo.HANGVE WHERE TenHangVe = N'Phổ Thông');
    DECLARE @KH03c INT = (SELECT MaKhachHang FROM dbo.KHACHHANG WHERE Email = 'le.van.cuong@example.com');
    INSERT INTO dbo.PHIEUDATCHO (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
    VALUES (@KH03c, @CB017, @HV_EcoH, 1, 800000, 'DA_HUY', SYSUTCDATETIME());
    DECLARE @PDC020 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
    VALUES ('SEED-VE-020', @CB017, @HV_EcoH, @KH03c, @PDC020, 800000, 'DA_HUY');
END;
GO

-- ─── Recalculate SoGheDaDat for all SEED flights ─────────────────────────────
UPDATE cthv
SET cthv.SoGheDaDat = (
    SELECT COUNT(*)
    FROM dbo.VE v
    WHERE v.MaChuyenBay = cthv.MaChuyenBay
      AND v.MaHangVe    = cthv.MaHangVe
      AND v.TrangThaiVe IN ('HOP_LE', 'DANG_GIU_CHO')
      AND v.IsDeleted   = 0
      AND v.MaVeCode    LIKE 'SEED-%'
)
FROM dbo.CT_HANGVE cthv
INNER JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = cthv.MaChuyenBay
WHERE cb.MaChuyenBayCode LIKE 'SEED-%';
GO

PRINT N'=== Tickets seed completed ===';
GO
