USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: tr_APP_CONFIG_AuditChange ===';
GO

-- Test 1: UPDATE ConfigValue → AUDIT_LOG entry with DuLieuCu / DuLieuMoi created
BEGIN TRAN;

-- Insert a test config key
INSERT INTO dbo.APP_CONFIG (ConfigKey, ConfigValue, MoTa)
VALUES ('TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR), 'old_value', N'Trigger test config');

DECLARE @AuditBefore INT;
SELECT @AuditBefore = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'APP_CONFIG'
  AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

-- Change the ConfigValue → trigger should log the change
UPDATE dbo.APP_CONFIG
SET ConfigValue = 'new_value'
WHERE ConfigKey = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR);

DECLARE @AuditAfter INT;
SELECT @AuditAfter = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'APP_CONFIG'
  AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

IF @AuditAfter <> @AuditBefore + 1
    RAISERROR(N'FAIL [tr_APP_CONFIG_AuditChange] Expected 1 new AUDIT_LOG entry for CONFIG_CHANGE', 16, 1);

-- Verify DuLieuCu contains old value and DuLieuMoi contains new value
IF NOT EXISTS (
    SELECT 1 FROM dbo.AUDIT_LOG
    WHERE TenBang = 'APP_CONFIG'
      AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
      AND TenHanhDong = 'CONFIG_CHANGE'
      AND DuLieuCu LIKE '%old_value%'
      AND DuLieuMoi LIKE '%new_value%'
)
    RAISERROR(N'FAIL [tr_APP_CONFIG_AuditChange] DuLieuCu/DuLieuMoi content incorrect', 16, 1);

PRINT N'PASS [tr_APP_CONFIG_AuditChange] ConfigValue change creates CONFIG_CHANGE audit entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: UPDATE MoTa (not ConfigValue) → no AUDIT_LOG entry added
BEGIN TRAN;

INSERT INTO dbo.APP_CONFIG (ConfigKey, ConfigValue, MoTa)
VALUES ('TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR), 'same_value', N'Original description');

DECLARE @AuditBefore2 INT;
SELECT @AuditBefore2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'APP_CONFIG'
  AND MaBanGhi = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

-- Update only MoTa, not ConfigValue
UPDATE dbo.APP_CONFIG
SET MoTa = N'Updated description'
WHERE ConfigKey = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR);

DECLARE @AuditAfter2 INT;
SELECT @AuditAfter2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'APP_CONFIG'
  AND MaBanGhi = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

IF @AuditAfter2 <> @AuditBefore2
    RAISERROR(N'FAIL [tr_APP_CONFIG_AuditChange] Non-ConfigValue update should not create audit entry', 16, 1);

PRINT N'PASS [tr_APP_CONFIG_AuditChange] Non-ConfigValue update creates no CONFIG_CHANGE entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: UpdatedAt is auto-updated when not explicitly set
BEGIN TRAN;

INSERT INTO dbo.APP_CONFIG (ConfigKey, ConfigValue, MoTa)
VALUES ('TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR), 'val', N'Timestamp test');

-- Set to known past time
UPDATE dbo.APP_CONFIG
SET UpdatedAt = '2020-01-01 00:00:00'
WHERE ConfigKey = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

-- Update something other than UpdatedAt → trigger should auto-set UpdatedAt
UPDATE dbo.APP_CONFIG
SET ConfigValue = 'val_changed'
WHERE ConfigKey = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

DECLARE @UpdatedAtAfter DATETIME2(0);
SELECT @UpdatedAtAfter = UpdatedAt FROM dbo.APP_CONFIG
WHERE ConfigKey = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

IF @UpdatedAtAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_APP_CONFIG_AuditChange] UpdatedAt not auto-updated by trigger', 16, 1);

PRINT N'PASS [tr_APP_CONFIG_AuditChange] UpdatedAt auto-updated on ConfigValue change';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== tr_APP_CONFIG_AuditChange: all tests passed ===';
GO
