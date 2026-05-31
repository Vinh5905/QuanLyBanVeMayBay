USE [$(DB_NAME)];
GO

-- Shared test setup: inserts minimal prerequisite data for all SP tests.
-- Each individual test file wraps its assertions in BEGIN TRAN / ROLLBACK
-- so no data persists between runs.
--
-- This file itself does NOT wrap in a transaction; it creates the objects
-- used by sub-tests. Run it once before individual test files.

-- THAM_SO values required by stored procedures
MERGE dbo.THAM_SO AS target
USING (VALUES
    ('ThoiGianDongBanVe',        '45',  N'Phút trước giờ bay đóng bán vé tại quầy'),
    ('TGDatVeChamNhat',          '120', N'Phút trước giờ bay để đặt vé qua app/web'),
    ('ThoiHanThanhToan',         '2',   N'Giờ thời hạn thanh toán giữ chỗ'),
    ('ThueVAT',                  '10',  N'% thuế VAT'),
    ('TGHuyChamNhat',            '0',   N'Phút trước giờ bay được phép hủy vé'),
    ('ThoiGianChoPhepDoiVe',     '24',  N'Giờ trước giờ bay được phép đổi chuyến'),
    ('ThoiGianMoCheckInOnline',  '24',  N'Giờ trước giờ bay mở check-in online'),
    ('ThoiGianDongCheckInOnline','60',  N'Phút trước giờ bay đóng check-in online'),
    ('ThoiGianMuaHanhLyUuDai',  '3',   N'Giờ trước giờ bay để dùng giá mua trước hành lý')
) AS src(TenThamSo, GiaTri, MoTa)
ON target.TenThamSo = src.TenThamSo
WHEN NOT MATCHED THEN
    INSERT (TenThamSo, GiaTri, MoTa) VALUES (src.TenThamSo, src.GiaTri, src.MoTa)
WHEN MATCHED THEN
    UPDATE SET GiaTri = src.GiaTri;
GO

PRINT N'Test helpers loaded.';
GO
