USE [$(DB_NAME)];
GO

-- Direct counter sale: creates VE immediately with TrangThaiVe = 'HOP_LE'.
-- MaVeCode format: 'VE' + yyyyMMddHHmmss + 4-digit random suffix.
-- Uses UPDLOCK/HOLDLOCK on CT_HANGVE to prevent overselling under concurrent load.
CREATE OR ALTER PROCEDURE dbo.sp_BanVe_Create
    @MaChuyenBay   INT,
    @MaKhachHang   INT,
    @MaHangVe      INT,
    @NgayGiaoDich  DATETIME2(0),   -- accepted for auditing, not stored; CreatedAt = SYSUTCDATETIME()
    @MaVe          INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @GiaVe          DECIMAL(18,2);
    DECLARE @SoLuong        INT;
    DECLARE @SoGheDaDat     INT;
    DECLARE @NgayGioBay     DATETIME2(0);
    DECLARE @ThoiGianDong   INT;
    DECLARE @MaVeCode       VARCHAR(30);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate chuyến bay với shared intent lock để đọc nhất quán
        SELECT @NgayGioBay = NgayGioBay
        FROM dbo.CHUYENBAY WITH (UPDLOCK, HOLDLOCK)
        WHERE MaChuyenBay = @MaChuyenBay AND IsDeleted = 0;

        IF @NgayGioBay IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 1001 AS ErrorCode, N'Chuyến bay không tồn tại hoặc đã bị xóa' AS Message;
            RETURN;
        END;

        -- Kiểm tra thời gian đóng bán vé (từ APP_CONFIG)
        SELECT @ThoiGianDong = TRY_CAST(ConfigValue AS INT)
        FROM dbo.APP_CONFIG WHERE ConfigKey = 'THOI_GIAN_DONG_BAN_VE';
        SET @ThoiGianDong = ISNULL(@ThoiGianDong, 24);

        IF DATEADD(HOUR, -@ThoiGianDong, @NgayGioBay) < SYSUTCDATETIME()
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 1002 AS ErrorCode, N'Đã quá thời gian bán vé cho chuyến bay này' AS Message;
            RETURN;
        END;

        -- Validate khách hàng
        IF NOT EXISTS (
            SELECT 1 FROM dbo.KHACHHANG
            WHERE MaKhachHang = @MaKhachHang AND IsDeleted = 0
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 1003 AS ErrorCode, N'Khách hàng không tồn tại' AS Message;
            RETURN;
        END;

        -- Kiểm tra ghế còn với row-level lock để tránh race condition
        SELECT @GiaVe = DonGia, @SoLuong = SoLuong, @SoGheDaDat = SoGheDaDat
        FROM dbo.CT_HANGVE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
        WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;

        IF @GiaVe IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 1004 AS ErrorCode, N'Hạng vé không tồn tại cho chuyến bay này' AS Message;
            RETURN;
        END;

        IF @SoLuong - @SoGheDaDat <= 0
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 1005 AS ErrorCode, N'Hết ghế cho hạng vé này' AS Message;
            RETURN;
        END;

        -- Tạo mã vé duy nhất
        SET @MaVeCode = 'VE' + FORMAT(SYSUTCDATETIME(), 'yyyyMMddHHmmss')
                      + RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(4)), 4);

        -- Tạo vé (bán thẳng tại quầy → hợp lệ ngay)
        INSERT INTO dbo.VE (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, GiaVe, TrangThaiVe)
        VALUES (@MaVeCode, @MaChuyenBay, @MaHangVe, @MaKhachHang, @GiaVe, 'HOP_LE');

        SET @MaVe = SCOPE_IDENTITY();

        -- Tăng số ghế đã đặt
        UPDATE dbo.CT_HANGVE
        SET SoGheDaDat = SoGheDaDat + 1
        WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;

        COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Bán vé thành công' AS Message,
               @MaVe    AS MaVe,
               @MaVeCode AS MaVeCode,
               @GiaVe   AS GiaVe;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
