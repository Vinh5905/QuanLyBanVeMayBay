USE [$(DB_NAME)];
GO

-- Scheduled job: cancels expired reservations (DANG_GIU_CHO with HanThanhToan < now).
-- Intended to run via SQL Server Agent Job or backend scheduler.
-- Uses temp table to safely capture expired set before modifying, avoiding
-- double-counting when computing seat refunds.
CREATE OR ALTER PROCEDURE dbo.sp_HuyDatCho_Auto
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SoPhieuDaHuy INT = 0;
    DECLARE @SoVeDaHuy    INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Snapshot expired reservations trước khi thay đổi
        CREATE TABLE #ExpiredPhieu (
            MaPhieuDatCho INT        NOT NULL,
            MaChuyenBay   INT        NOT NULL,
            MaHangVe      INT        NOT NULL
        );

        INSERT INTO #ExpiredPhieu (MaPhieuDatCho, MaChuyenBay, MaHangVe)
        SELECT MaPhieuDatCho, MaChuyenBay, MaHangVe
        FROM dbo.PHIEUDATCHO WITH (UPDLOCK)
        WHERE HanThanhToan   < SYSUTCDATETIME()
          AND TrangThaiDatCho = 'DANG_GIU_CHO';

        IF NOT EXISTS (SELECT 1 FROM #ExpiredPhieu)
        BEGIN
            DROP TABLE #ExpiredPhieu;
            COMMIT TRANSACTION;
            SELECT 0 AS ErrorCode, N'Không có phiếu đặt chỗ hết hạn' AS Message,
                   0 AS SoPhieuDaHuy, 0 AS SoVeDaHuy;
            RETURN;
        END;

        -- Hủy vé giữ chỗ
        UPDATE v
        SET v.TrangThaiVe = 'DA_HUY',
            v.IsDeleted   = 1,
            v.UpdatedAt   = SYSUTCDATETIME()
        FROM dbo.VE v
        INNER JOIN #ExpiredPhieu ep ON v.MaPhieuDatCho = ep.MaPhieuDatCho
        WHERE v.TrangThaiVe = 'DANG_GIU_CHO';

        SET @SoVeDaHuy = @@ROWCOUNT;

        -- Hoàn ghế: đếm số vé bị hủy theo chuyến/hạng để update đúng số lượng
        UPDATE ct
        SET ct.SoGheDaDat = ct.SoGheDaDat - refund.SoVeHuy
        FROM dbo.CT_HANGVE ct
        INNER JOIN (
            SELECT v.MaChuyenBay, v.MaHangVe, COUNT(*) AS SoVeHuy
            FROM dbo.VE v
            INNER JOIN #ExpiredPhieu ep ON v.MaPhieuDatCho = ep.MaPhieuDatCho
            GROUP BY v.MaChuyenBay, v.MaHangVe
        ) refund ON ct.MaChuyenBay = refund.MaChuyenBay
                AND ct.MaHangVe    = refund.MaHangVe;

        -- Hủy phiếu đặt chỗ
        UPDATE dbo.PHIEUDATCHO
        SET TrangThaiDatCho = 'DA_HUY', UpdatedAt = SYSUTCDATETIME()
        WHERE MaPhieuDatCho IN (SELECT MaPhieuDatCho FROM #ExpiredPhieu);

        SET @SoPhieuDaHuy = @@ROWCOUNT;

        DROP TABLE #ExpiredPhieu;

        COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Hoàn thành hủy đặt chỗ tự động' AS Message,
               @SoPhieuDaHuy AS SoPhieuDaHuy,
               @SoVeDaHuy    AS SoVeDaHuy;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        IF OBJECT_ID('tempdb..#ExpiredPhieu') IS NOT NULL DROP TABLE #ExpiredPhieu;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
