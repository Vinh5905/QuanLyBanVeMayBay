USE [$(DB_NAME)];
GO

-- Records a CONFIG_CHANGE audit entry whenever ConfigValue changes on APP_CONFIG.
-- DuLieuCu and DuLieuMoi are stored as simple JSON with ConfigKey + ConfigValue.
-- Also keeps UpdatedAt current (APP_CONFIG is not covered by tr_AutoUpdateTimestamp).
CREATE OR ALTER TRIGGER dbo.tr_APP_CONFIG_AuditChange
ON dbo.APP_CONFIG
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Keep UpdatedAt current when not explicitly set
    IF NOT UPDATE(UpdatedAt)
    BEGIN
        UPDATE c SET UpdatedAt = SYSUTCDATETIME()
        FROM dbo.APP_CONFIG c
        INNER JOIN inserted i ON c.ConfigKey = i.ConfigKey;
    END;

    -- Audit only rows where ConfigValue actually changed
    INSERT INTO dbo.AUDIT_LOG
        (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, DuLieuCu, DuLieuMoi, ThoiGian)
    SELECT
        i.UpdatedBy,
        'CONFIG_CHANGE',
        'APP_CONFIG',
        i.ConfigKey,
        N'{"ConfigKey":"' + d.ConfigKey + N'","ConfigValue":"' + d.ConfigValue + N'"}',
        N'{"ConfigKey":"' + i.ConfigKey + N'","ConfigValue":"' + i.ConfigValue + N'"}',
        SYSUTCDATETIME()
    FROM inserted i
    INNER JOIN deleted d ON i.ConfigKey = d.ConfigKey
    WHERE i.ConfigValue <> d.ConfigValue;
END;
GO
