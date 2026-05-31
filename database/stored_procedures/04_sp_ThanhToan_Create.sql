USE [$(DB_NAME)];
GO

-- Payment processing for two flows:
--   A. From reservation (MaPhieuDatCho): finds the linked VE (TrangThaiVe='DANG_GIU_CHO'),
--      inserts THANHTOAN, updates VE → 'HOP_LE', updates PHIEUDATCHO → 'DA_THANH_TOAN'.
--   B. From direct ticket (MaVe): inserts THANHTOAN, updates VE → 'HOP_LE'.
-- Exactly one of @MaPhieuDatCho / @MaVe must be provided.
CREATE OR ALTER PROCEDURE dbo.sp_ThanhToan_Create
    @MaPhieuDatCho     INT           = NULL,
    @MaVe              INT           = NULL,
    @HinhThucThanhToan VARCHAR(30),
    @SoTienThanhToan   DECIMAL(18,2),
    @MaGiaoDich        VARCHAR(100)  = NULL,
    @MaThanhToan       INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @OuterTranCount INT = @@TRANCOUNT;

    DECLARE @MaVeTarget      INT;
    DECLARE @GiaGoc          DECIMAL(18,2);
    DECLARE @HanThanhToan    DATETIME2(0);
    DECLARE @TrangThaiDatCho VARCHAR(30);
    DECLARE @TrangThaiVe     VARCHAR(30);
    DECLARE @ThuVAT          DECIMAL(18,2);
    DECLARE @GiaSauThue      DECIMAL(18,2);
    DECLARE @ThueVATAmount   DECIMAL(18,2);

    -- Đúng một trong hai phải được cung cấp
    IF (@MaPhieuDatCho IS NULL AND @MaVe IS NULL)
       OR (@MaPhieuDatCho IS NOT NULL AND @MaVe IS NOT NULL)
    BEGIN
        SELECT 3001 AS ErrorCode,
               N'Phải cung cấp đúng một trong hai: MaPhieuDatCho hoặc MaVe' AS Message;
        RETURN;
    END;

    BEGIN TRY
        IF @OuterTranCount = 0 BEGIN TRANSACTION;

        IF @MaPhieuDatCho IS NOT NULL
        BEGIN
            -- Lấy thông tin phiếu đặt chỗ với lock
            SELECT @TrangThaiDatCho = TrangThaiDatCho,
                   @HanThanhToan    = HanThanhToan,
                   @GiaGoc          = TongTien
            FROM dbo.PHIEUDATCHO WITH (UPDLOCK, HOLDLOCK)
            WHERE MaPhieuDatCho = @MaPhieuDatCho;

            IF @TrangThaiDatCho IS NULL
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3002 AS ErrorCode, N'Phiếu đặt chỗ không tồn tại' AS Message;
                RETURN;
            END;

            IF @TrangThaiDatCho <> 'DANG_GIU_CHO'
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3003 AS ErrorCode,
                       N'Phiếu đặt chỗ không ở trạng thái chờ thanh toán. Trạng thái hiện tại: '
                       + @TrangThaiDatCho AS Message;
                RETURN;
            END;

            IF @HanThanhToan < SYSUTCDATETIME()
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3004 AS ErrorCode, N'Đã quá hạn thanh toán' AS Message;
                RETURN;
            END;

            -- Lấy vé giữ chỗ được tạo bởi sp_DatVe_Create
            SELECT @MaVeTarget = MaVe
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK)
            WHERE MaPhieuDatCho = @MaPhieuDatCho
              AND TrangThaiVe   = 'DANG_GIU_CHO'
              AND IsDeleted     = 0;

            IF @MaVeTarget IS NULL
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3005 AS ErrorCode,
                       N'Không tìm thấy vé giữ chỗ liên kết với phiếu đặt chỗ' AS Message;
                RETURN;
            END;
        END
        ELSE
        BEGIN
            -- Thanh toán cho vé bán thẳng (BanVe flow)
            SELECT @TrangThaiVe = TrangThaiVe, @GiaGoc = GiaVe
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK)
            WHERE MaVe = @MaVe AND IsDeleted = 0;

            IF @GiaGoc IS NULL
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3006 AS ErrorCode, N'Vé không tồn tại' AS Message;
                RETURN;
            END;

            IF @TrangThaiVe NOT IN ('HOP_LE', 'DANG_GIU_CHO')
            BEGIN
                IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                SELECT 3007 AS ErrorCode,
                       N'Vé không hợp lệ để thanh toán. Trạng thái: ' + @TrangThaiVe AS Message;
                RETURN;
            END;

            SET @MaVeTarget = @MaVe;
        END;

        -- Tính thuế VAT từ APP_CONFIG
        SELECT @ThuVAT = TRY_CAST(ConfigValue AS DECIMAL(18,2)) / 100
        FROM dbo.APP_CONFIG WHERE ConfigKey = 'THUE_VAT';
        SET @ThuVAT = ISNULL(@ThuVAT, 0.10);

        SET @ThueVATAmount = @GiaGoc * @ThuVAT;
        SET @GiaSauThue    = @GiaGoc + @ThueVATAmount;

        -- Kiểm tra số tiền đủ (100%)
        IF @SoTienThanhToan < @GiaSauThue
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 3008 AS ErrorCode,
                   N'Số tiền không đủ. Yêu cầu: ' + CAST(@GiaSauThue AS VARCHAR(30)) AS Message;
            RETURN;
        END;

        -- Ghi nhận thanh toán
        INSERT INTO dbo.THANHTOAN
            (MaVe, MaPhieuDatCho, SoTien, ThueVAT, PhuongThuc,
             TrangThaiThanhToan, MaGiaoDich, ThoiGianThanhToan)
        VALUES
            (@MaVeTarget, @MaPhieuDatCho, @GiaSauThue, @ThueVATAmount,
             @HinhThucThanhToan, 'COMPLETED', @MaGiaoDich, SYSUTCDATETIME());

        SET @MaThanhToan = SCOPE_IDENTITY();

        -- Kích hoạt vé
        UPDATE dbo.VE
        SET TrangThaiVe = 'HOP_LE', UpdatedAt = SYSUTCDATETIME()
        WHERE MaVe = @MaVeTarget;

        -- Xác nhận phiếu đặt chỗ (nếu có)
        IF @MaPhieuDatCho IS NOT NULL
        BEGIN
            UPDATE dbo.PHIEUDATCHO
            SET TrangThaiDatCho = 'DA_THANH_TOAN', UpdatedAt = SYSUTCDATETIME()
            WHERE MaPhieuDatCho = @MaPhieuDatCho;
        END;

        IF @OuterTranCount = 0 COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Thanh toán thành công' AS Message,
               @MaThanhToan  AS MaThanhToan,
               @GiaSauThue   AS GiaSauThue,
               @ThueVATAmount AS ThueVAT,
               @MaVeTarget   AS MaVe;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 AND @OuterTranCount = 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
