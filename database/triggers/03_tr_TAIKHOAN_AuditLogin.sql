USE [$(DB_NAME)];
GO

-- Records a USER_LOGIN audit entry whenever LastLogin changes on TAIKHOAN.
-- Skips silently if LastLogin was not part of the UPDATE statement.
CREATE OR ALTER TRIGGER dbo.tr_TAIKHOAN_AuditLogin
ON dbo.TAIKHOAN
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(LastLogin) RETURN;

    INSERT INTO dbo.AUDIT_LOG (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, ThoiGian)
    SELECT
        i.MaTaiKhoan,
        'USER_LOGIN',
        'TAIKHOAN',
        CAST(i.MaTaiKhoan AS VARCHAR(50)),
        SYSUTCDATETIME()
    FROM inserted i
    INNER JOIN deleted d ON i.MaTaiKhoan = d.MaTaiKhoan
    WHERE ISNULL(CAST(i.LastLogin AS NVARCHAR(50)), '') <> ISNULL(CAST(d.LastLogin AS NVARCHAR(50)), '');
END;
GO
