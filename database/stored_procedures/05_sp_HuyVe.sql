USE [$(DB_NAME)];
GO

CREATE OR ALTER PROCEDURE dbo.sp_HuyVe
    @MaVe        INT,
    @NguoiHuy    INT           = NULL,
    @LyDoHuy     NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @OuterTranCount INT = @@TRANCOUNT;

    DECLARE @TrangThaiVe   VARCHAR(30);
    DECLARE @MaChuyenBay   INT;
    DECLARE @MaHangVe      INT;
    DECLARE @MaPhieuDatCho INT;
    DECLARE @NgayGioBay    DATETIME2(0);
    DECLARE @TGHuyChamNhat INT;

    BEGIN TRY
        IF @OuterTranCount = 0 BEGIN TRANSACTION;

        SELECT @TrangThaiVe   = TrangThaiVe,
               @MaChuyenBay   = MaChuyenBay,
               @MaHangVe      = MaHangVe,
               @MaPhieuDatCho = MaPhieuDatCho
        FROM dbo.VE WITH (UPDLOCK, HOLDLOCK)
        WHERE MaVe = @MaVe AND IsDeleted = 0;

        IF @TrangThaiVe IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 4001 AS ErrorCode, N'Vé không tồn tại' AS Message;
            RETURN;
        END;

        IF @TrangThaiVe <> 'HOP_LE'
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 4002 AS ErrorCode,
                   N'Chỉ có thể hủy vé ở trạng thái HOP_LE. Trạng thái hiện tại: '
                   + @TrangThaiVe AS Message;
            RETURN;
        END;

        -- Lấy giờ bay
        SELECT @NgayGioBay = NgayGioBay
        FROM dbo.CHUYENBAY WITH (NOLOCK)
        WHERE MaChuyenBay = @MaChuyenBay;

        -- Kiểm tra thời gian hủy chậm nhất (TGHuyChamNhat, đơn vị phút, mặc định 0 = đến tận giờ bay)
        SELECT @TGHuyChamNhat = TRY_CAST(GiaTri AS INT)
        FROM dbo.THAM_SO WHERE TenThamSo = 'TGHuyChamNhat';
        SET @TGHuyChamNhat = ISNULL(@TGHuyChamNhat, 0);

        IF SYSUTCDATETIME() >= DATEADD(MINUTE, -@TGHuyChamNhat, @NgayGioBay)
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 4003 AS ErrorCode,
                   N'Không thể hủy vé. Thời hạn hủy đã qua.' AS Message;
            RETURN;
        END;

        -- Hủy vé
        UPDATE dbo.VE
        SET TrangThaiVe = 'DA_HUY',
            IsDeleted   = 1,
            UpdatedAt   = SYSUTCDATETIME()
        WHERE MaVe = @MaVe;

        -- Hoàn ghế
        UPDATE dbo.CT_HANGVE
        SET SoGheDaDat = SoGheDaDat - 1
        WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;

        -- Đồng bộ trạng thái phiếu đặt chỗ (nếu có)
        IF @MaPhieuDatCho IS NOT NULL
        BEGIN
            UPDATE dbo.PHIEUDATCHO
            SET TrangThaiDatCho = 'DA_HUY', UpdatedAt = SYSUTCDATETIME()
            WHERE MaPhieuDatCho = @MaPhieuDatCho;
        END;

        IF @OuterTranCount = 0 COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Hủy vé thành công' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 AND @OuterTranCount = 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
