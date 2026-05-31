USE [$(DB_NAME)];
GO

-- Records a CONFIG_CHANGE audit entry whenever GiaTri changes on THAM_SO.
-- DuLieuCu and DuLieuMoi are stored as simple JSON with TenThamSo + GiaTri.
-- Also keeps CapNhatLuc current (THAM_SO is not covered by tr_AutoUpdateTimestamp).
CREATE OR ALTER TRIGGER dbo.tr_THAM_SO_AuditChange
ON dbo.THAM_SO
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Keep CapNhatLuc current when not explicitly set
    IF NOT UPDATE(CapNhatLuc)
    BEGIN
        UPDATE c SET CapNhatLuc = SYSUTCDATETIME()
        FROM dbo.THAM_SO c
        INNER JOIN inserted i ON c.TenThamSo = i.TenThamSo;
    END;

    -- Audit only rows where GiaTri actually changed
    INSERT INTO dbo.AUDIT_LOG
        (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, DuLieuCu, DuLieuMoi, ThoiGian)
    SELECT
        i.CapNhatBoi,
        'CONFIG_CHANGE',
        'THAM_SO',
        i.TenThamSo,
        N'{"TenThamSo":"' + d.TenThamSo + N'","GiaTri":"' + d.GiaTri + N'"}',
        N'{"TenThamSo":"' + i.TenThamSo + N'","GiaTri":"' + i.GiaTri + N'"}',
        SYSUTCDATETIME()
    FROM inserted i
    INNER JOIN deleted d ON i.TenThamSo = d.TenThamSo
    WHERE i.GiaTri <> d.GiaTri;
END;
GO
