USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== TEST: tr_THAM_SO_AuditChange ===';
GO

-- Test 1: UPDATE GiaTri → AUDIT_LOG entry with DuLieuCu / DuLieuMoi created
BEGIN TRAN;

INSERT INTO dbo.THAM_SO (TenThamSo, GiaTri, MoTa)
VALUES ('TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR), 'old_value', N'Trigger test config');

DECLARE @AuditBefore INT;
SELECT @AuditBefore = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'THAM_SO'
  AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

UPDATE dbo.THAM_SO
SET GiaTri = 'new_value'
WHERE TenThamSo = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR);

DECLARE @AuditAfter INT;
SELECT @AuditAfter = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'THAM_SO'
  AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

IF @AuditAfter <> @AuditBefore + 1
    RAISERROR(N'FAIL [tr_THAM_SO_AuditChange] Expected 1 new AUDIT_LOG entry for CONFIG_CHANGE', 16, 1);

IF NOT EXISTS (
    SELECT 1 FROM dbo.AUDIT_LOG
    WHERE TenBang = 'THAM_SO'
      AND MaBanGhi = 'TEST_TRIGGER_KEY_' + CAST(@@SPID AS VARCHAR)
      AND TenHanhDong = 'CONFIG_CHANGE'
      AND DuLieuCu LIKE '%old_value%'
      AND DuLieuMoi LIKE '%new_value%'
)
    RAISERROR(N'FAIL [tr_THAM_SO_AuditChange] DuLieuCu/DuLieuMoi content incorrect', 16, 1);

PRINT N'PASS [tr_THAM_SO_AuditChange] GiaTri change creates CONFIG_CHANGE audit entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 2: UPDATE MoTa (not GiaTri) → no AUDIT_LOG entry added
BEGIN TRAN;

INSERT INTO dbo.THAM_SO (TenThamSo, GiaTri, MoTa)
VALUES ('TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR), 'same_value', N'Original description');

DECLARE @AuditBefore2 INT;
SELECT @AuditBefore2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'THAM_SO'
  AND MaBanGhi = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

UPDATE dbo.THAM_SO
SET MoTa = N'Updated description'
WHERE TenThamSo = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR);

DECLARE @AuditAfter2 INT;
SELECT @AuditAfter2 = COUNT(*) FROM dbo.AUDIT_LOG
WHERE TenBang = 'THAM_SO'
  AND MaBanGhi = 'TEST_TRIGGER_KEY2_' + CAST(@@SPID AS VARCHAR)
  AND TenHanhDong = 'CONFIG_CHANGE';

IF @AuditAfter2 <> @AuditBefore2
    RAISERROR(N'FAIL [tr_THAM_SO_AuditChange] Non-GiaTri update should not create audit entry', 16, 1);

PRINT N'PASS [tr_THAM_SO_AuditChange] Non-GiaTri update creates no CONFIG_CHANGE entry';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

-- Test 3: CapNhatLuc is auto-updated when not explicitly set
BEGIN TRAN;

INSERT INTO dbo.THAM_SO (TenThamSo, GiaTri, MoTa)
VALUES ('TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR), 'val', N'Timestamp test');

UPDATE dbo.THAM_SO
SET CapNhatLuc = '2020-01-01 00:00:00'
WHERE TenThamSo = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

UPDATE dbo.THAM_SO
SET GiaTri = 'val_changed'
WHERE TenThamSo = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

DECLARE @CapNhatLucAfter DATETIME2(0);
SELECT @CapNhatLucAfter = CapNhatLuc FROM dbo.THAM_SO
WHERE TenThamSo = 'TEST_TRIGGER_KEY3_' + CAST(@@SPID AS VARCHAR);

IF @CapNhatLucAfter <= '2020-01-01 00:00:00'
    RAISERROR(N'FAIL [tr_THAM_SO_AuditChange] CapNhatLuc not auto-updated by trigger', 16, 1);

PRINT N'PASS [tr_THAM_SO_AuditChange] CapNhatLuc auto-updated on GiaTri change';

IF @@TRANCOUNT > 0 ROLLBACK;
GO

PRINT N'=== tr_THAM_SO_AuditChange: all tests passed ===';
GO
