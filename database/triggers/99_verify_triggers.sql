USE [$(DB_NAME)];
GO

-- Verify all expected triggers exist
DECLARE @Missing TABLE (TriggerName VARCHAR(100));

INSERT INTO @Missing (TriggerName)
SELECT expected.name
FROM (VALUES
    ('tr_TAIKHOAN_AutoUpdateTimestamp'),
    ('tr_KHACHHANG_AutoUpdateTimestamp'),
    ('tr_CHUYENBAY_AutoUpdateTimestamp'),
    ('tr_VE_AutoUpdateTimestamp'),
    ('tr_PHIEUDATCHO_AutoUpdateTimestamp'),
    ('tr_CHUYENBAY_PreventDelete'),
    ('tr_TAIKHOAN_AuditLogin'),
    ('tr_THAM_SO_AuditChange')
) AS expected(name)
WHERE NOT EXISTS (
    SELECT 1 FROM sys.triggers
    WHERE name      = expected.name
      AND parent_id > 0
);

IF EXISTS (SELECT 1 FROM @Missing)
BEGIN
    SELECT 'MISSING' AS Status, TriggerName FROM @Missing;
    RAISERROR(N'One or more triggers are missing. See result set above.', 16, 1);
END
ELSE
BEGIN
    SELECT 'OK' AS Status, name AS TriggerName
    FROM sys.triggers
    WHERE name IN (
        'tr_TAIKHOAN_AutoUpdateTimestamp',
        'tr_KHACHHANG_AutoUpdateTimestamp',
        'tr_CHUYENBAY_AutoUpdateTimestamp',
        'tr_VE_AutoUpdateTimestamp',
        'tr_PHIEUDATCHO_AutoUpdateTimestamp',
        'tr_CHUYENBAY_PreventDelete',
        'tr_TAIKHOAN_AuditLogin',
        'tr_THAM_SO_AuditChange'
    )
    ORDER BY name;

    PRINT N'All triggers verified OK.';
END;
GO
