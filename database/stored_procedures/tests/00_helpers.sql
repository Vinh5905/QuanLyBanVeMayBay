USE [$(DB_NAME)];
GO

-- Shared test setup: inserts minimal prerequisite data for all SP tests.
-- Each individual test file wraps its assertions in BEGIN TRAN / ROLLBACK
-- so no data persists between runs.
--
-- This file itself does NOT wrap in a transaction; it creates the objects
-- used by sub-tests. Run it once before individual test files.

-- APP_CONFIG values required by stored procedures
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

PRINT N'Test helpers loaded.';
GO
