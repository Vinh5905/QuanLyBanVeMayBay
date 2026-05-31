USE [$(DB_NAME)];
GO

-- Shared setup for trigger tests. Does NOT wrap in a transaction;
-- individual test files handle their own BEGIN TRAN / ROLLBACK.

-- Ensure THAM_SO values are present (same as SP tests)
MERGE dbo.THAM_SO AS target
USING (VALUES
    ('ThoiGianDongBanVe',        '45',  N'Phút trước giờ bay đóng bán vé tại quầy'),
    ('TGDatVeChamNhat',          '120', N'Phút trước giờ bay để đặt vé qua app/web'),
    ('ThoiHanThanhToan',         '2',   N'Giờ thời hạn thanh toán giữ chỗ'),
    ('ThueVAT',                  '10',  N'% thuế VAT'),
    ('TGHuyChamNhat',            '0',   N'Phút trước giờ bay được phép hủy vé'),
    ('ThoiGianChoPhepDoiVe',     '24',  N'Giờ trước giờ bay được phép đổi chuyến'),
    ('ThoiGianMoCheckInOnline',  '24',  N'Giờ trước giờ bay mở check-in online'),
    ('ThoiGianDongCheckInOnline','60',  N'Phút trước giờ bay đóng check-in online')
) AS src(TenThamSo, GiaTri, MoTa)
ON target.TenThamSo = src.TenThamSo
WHEN NOT MATCHED THEN
    INSERT (TenThamSo, GiaTri, MoTa) VALUES (src.TenThamSo, src.GiaTri, src.MoTa)
WHEN MATCHED THEN
    UPDATE SET GiaTri = src.GiaTri;
GO

PRINT N'Trigger test helpers loaded.';
GO
