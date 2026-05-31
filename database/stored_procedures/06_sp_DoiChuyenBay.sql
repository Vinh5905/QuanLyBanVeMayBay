USE [$(DB_NAME)];
GO

-- Flight change for an existing HOP_LE ticket:
--   - New flight must be on the same route (SanBayDi/SanBayDen must match).
--   - Ticket status after change: 'HOP_LE' (still valid, now on new flight).
--   - Old seat is released; new seat is reserved.
--   - Time-window check uses ThoiGianChoPhepDoiVe (hours before departure).
CREATE OR ALTER PROCEDURE dbo.sp_DoiChuyenBay
    @MaVe            INT,
    @MaChuyenBayMoi  INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @OuterTranCount INT = @@TRANCOUNT;

    DECLARE @TrangThaiVe     VARCHAR(30);
    DECLARE @MaChuyenBayCu   INT;
    DECLARE @MaHangVe        INT;
    DECLARE @MaPhieuDatCho   INT;
    DECLARE @SanBayDi        VARCHAR(10);
    DECLARE @SanBayDen       VARCHAR(10);
    DECLARE @NgayGioBayCu    DATETIME2(0);
    DECLARE @SanBayDiMoi     VARCHAR(10);
    DECLARE @SanBayDenMoi    VARCHAR(10);
    DECLARE @NgayGioBayMoi   DATETIME2(0);
    DECLARE @GiaMoi          DECIMAL(18,2);
    DECLARE @SoLuongMoi      INT;
    DECLARE @SoGheDaDatMoi   INT;
    DECLARE @ThoiGianChoPhep INT;

    BEGIN TRY
        IF @OuterTranCount = 0 BEGIN TRANSACTION;

        -- Lấy thông tin vé hiện tại với lock
        SELECT @TrangThaiVe   = TrangThaiVe,
               @MaChuyenBayCu = MaChuyenBay,
               @MaHangVe      = MaHangVe,
               @MaPhieuDatCho = MaPhieuDatCho
        FROM dbo.VE WITH (UPDLOCK, HOLDLOCK)
        WHERE MaVe = @MaVe AND IsDeleted = 0;

        IF @TrangThaiVe IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5001 AS ErrorCode, N'Vé không tồn tại' AS Message;
            RETURN;
        END;

        IF @TrangThaiVe <> 'HOP_LE'
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5002 AS ErrorCode,
                   N'Chỉ đổi được vé ở trạng thái HOP_LE. Trạng thái hiện tại: '
                   + @TrangThaiVe AS Message;
            RETURN;
        END;

        -- Lấy thông tin chuyến bay cũ
        SELECT @SanBayDi = SanBayDi, @SanBayDen = SanBayDen, @NgayGioBayCu = NgayGioBay
        FROM dbo.CHUYENBAY WITH (NOLOCK)
        WHERE MaChuyenBay = @MaChuyenBayCu;

        -- Kiểm tra cửa sổ thời gian cho phép đổi (trước N giờ khởi hành cũ)
        SELECT @ThoiGianChoPhep = TRY_CAST(GiaTri AS INT)
        FROM dbo.THAM_SO WHERE TenThamSo = 'ThoiGianChoPhepDoiVe';
        SET @ThoiGianChoPhep = ISNULL(@ThoiGianChoPhep, 24);

        IF DATEADD(HOUR, -@ThoiGianChoPhep, @NgayGioBayCu) < SYSUTCDATETIME()
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5003 AS ErrorCode, N'Đã quá thời gian cho phép đổi chuyến' AS Message;
            RETURN;
        END;

        -- Validate chuyến bay mới
        SELECT @SanBayDiMoi  = SanBayDi,
               @SanBayDenMoi = SanBayDen,
               @NgayGioBayMoi = NgayGioBay
        FROM dbo.CHUYENBAY WITH (UPDLOCK, HOLDLOCK)
        WHERE MaChuyenBay = @MaChuyenBayMoi AND IsDeleted = 0;

        IF @NgayGioBayMoi IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5004 AS ErrorCode, N'Chuyến bay mới không tồn tại' AS Message;
            RETURN;
        END;

        -- Kiểm tra cùng tuyến bay
        IF @SanBayDiMoi <> @SanBayDi OR @SanBayDenMoi <> @SanBayDen
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5005 AS ErrorCode,
                   N'Chuyến bay mới phải cùng tuyến (sân bay đi - đến)' AS Message;
            RETURN;
        END;

        -- Kiểm tra ghế hạng vé trên chuyến mới với lock
        SELECT @GiaMoi = DonGia, @SoLuongMoi = SoLuong, @SoGheDaDatMoi = SoGheDaDat
        FROM dbo.CT_HANGVE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
        WHERE MaChuyenBay = @MaChuyenBayMoi AND MaHangVe = @MaHangVe;

        IF @GiaMoi IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5006 AS ErrorCode,
                   N'Hạng vé không tồn tại trên chuyến bay mới' AS Message;
            RETURN;
        END;

        IF @SoLuongMoi - @SoGheDaDatMoi <= 0
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 5007 AS ErrorCode, N'Hết ghế trên chuyến bay mới' AS Message;
            RETURN;
        END;

        -- Cập nhật vé sang chuyến mới (vẫn HOP_LE sau khi đổi)
        UPDATE dbo.VE
        SET MaChuyenBay = @MaChuyenBayMoi,
            GiaVe       = @GiaMoi,
            UpdatedAt   = SYSUTCDATETIME()
        WHERE MaVe = @MaVe;

        -- Hoàn ghế chuyến cũ
        UPDATE dbo.CT_HANGVE
        SET SoGheDaDat = SoGheDaDat - 1
        WHERE MaChuyenBay = @MaChuyenBayCu AND MaHangVe = @MaHangVe;

        -- Đặt ghế chuyến mới
        UPDATE dbo.CT_HANGVE
        SET SoGheDaDat = SoGheDaDat + 1
        WHERE MaChuyenBay = @MaChuyenBayMoi AND MaHangVe = @MaHangVe;

        IF @OuterTranCount = 0 COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Đổi chuyến bay thành công' AS Message,
               @MaVe            AS MaVe,
               @MaChuyenBayMoi  AS MaChuyenBayMoi,
               @GiaMoi          AS GiaVeMoi;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 AND @OuterTranCount = 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
