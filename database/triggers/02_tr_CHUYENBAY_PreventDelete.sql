USE [$(DB_NAME)];
GO

-- Intercepts DELETE on CHUYENBAY:
--   - If any active VE (IsDeleted=0) or active PHIEUDATCHO exists → RAISERROR (no ROLLBACK,
--     so the caller's transaction survives and can be handled upstream).
--   - Otherwise → soft delete (IsDeleted=1) instead of physical removal.
CREATE OR ALTER TRIGGER dbo.tr_CHUYENBAY_PreventDelete
ON dbo.CHUYENBAY
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM dbo.VE v
        INNER JOIN deleted d ON v.MaChuyenBay = d.MaChuyenBay
        WHERE v.IsDeleted = 0
    )
    OR EXISTS (
        SELECT 1 FROM dbo.PHIEUDATCHO p
        INNER JOIN deleted d ON p.MaChuyenBay = d.MaChuyenBay
        WHERE p.TrangThaiDatCho NOT IN ('DA_HUY')
    )
    BEGIN
        RAISERROR(N'Không thể xóa chuyến bay đã có vé hoặc đặt chỗ đang hoạt động', 16, 1);
        RETURN;
    END;

    UPDATE dbo.CHUYENBAY
    SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME()
    WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM deleted);
END;
GO
