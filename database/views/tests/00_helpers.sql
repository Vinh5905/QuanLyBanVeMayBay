USE [$(DB_NAME)];
GO

-- Shared setup for view tests. Individual test files handle their own BEGIN TRAN / ROLLBACK.

MERGE dbo.APP_CONFIG AS target
USING (VALUES
    ('THOI_GIAN_DONG_BAN_VE',  '24',     N'Giờ trước giờ bay đóng bán vé'),
    ('THOI_HAN_THANH_TOAN',    '2',      N'Giờ thời hạn thanh toán'),
    ('THUE_VAT',               '10',     N'% thuế VAT'),
    ('PHI_HUY_VE',             '100000', N'Phí hủy vé (VNĐ)'),
    ('PHI_DOI_VE',             '200000', N'Phí đổi chuyến (VNĐ)'),
    ('THOI_GIAN_MO_CHECKIN',   '24',     N'Giờ trước giờ bay mở check-in'),
    ('THOI_GIAN_DONG_CHECKIN', '60',     N'Phút trước giờ bay đóng check-in')
) AS src(ConfigKey, ConfigValue, MoTa)
ON target.ConfigKey = src.ConfigKey
WHEN NOT MATCHED THEN
    INSERT (ConfigKey, ConfigValue, MoTa) VALUES (src.ConfigKey, src.ConfigValue, src.MoTa)
WHEN MATCHED THEN
    UPDATE SET ConfigValue = src.ConfigValue;
GO

PRINT N'View test helpers loaded.';
GO
