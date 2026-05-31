USE [$(DB_NAME)];
GO

CREATE OR ALTER PROCEDURE dbo.sp_AuditLog_Insert
    @MaTaiKhoan  INT           = NULL,
    @TenHanhDong VARCHAR(100),
    @TenBang     VARCHAR(100)  = NULL,
    @MaBanGhi    VARCHAR(50)   = NULL,
    @DuLieuCu   NVARCHAR(MAX) = NULL,
    @DuLieuMoi  NVARCHAR(MAX) = NULL,
    @IpAddress   VARCHAR(50)   = NULL,
    @UserAgent   VARCHAR(500)  = NULL,
    @NewId       BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Fire-and-forget: no transaction wrapper needed, INSERT is atomic
    INSERT INTO dbo.AUDIT_LOG
        (MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, DuLieuCu, DuLieuMoi, IpAddress, UserAgent)
    VALUES
        (@MaTaiKhoan, @TenHanhDong, @TenBang, @MaBanGhi, @DuLieuCu, @DuLieuMoi, @IpAddress, @UserAgent);

    SET @NewId = SCOPE_IDENTITY();

    SELECT 0 AS ErrorCode, N'Thành công' AS Message, @NewId AS NewId;
END;
GO
