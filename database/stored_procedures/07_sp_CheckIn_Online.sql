USE [$(DB_NAME)];
GO

-- Online check-in with time-window enforcement from APP_CONFIG:
--   Window opens:  NgayGioBay - THOI_GIAN_MO_CHECKIN hours   (default 24h)
--   Window closes: NgayGioBay - THOI_GIAN_DONG_CHECKIN minutes (default 60min)
-- BoardingPassCode format: 'BP' + yyyyMMddHHmmss + 6-digit random suffix.
CREATE OR ALTER PROCEDURE dbo.sp_CheckIn_Online
    @MaVe            INT,
    @SoGhe           VARCHAR(10),
    @ThoiDiemCheckIn DATETIME2(0) = NULL,   -- defaults to SYSUTCDATETIME() if not provided
    @MaCheckIn       INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @OuterTranCount INT = @@TRANCOUNT;

    DECLARE @TrangThaiVe   VARCHAR(30);
    DECLARE @MaChuyenBay   INT;
    DECLARE @NgayGioBay    DATETIME2(0);
    DECLARE @TGMoCheckIn   INT;
    DECLARE @TGDongCheckIn INT;
    DECLARE @ThoiDiem      DATETIME2(0);
    DECLARE @BoardingPassCode VARCHAR(100);

    SET @ThoiDiem = ISNULL(@ThoiDiemCheckIn, SYSUTCDATETIME());

    BEGIN TRY
        IF @OuterTranCount = 0 BEGIN TRANSACTION;

        -- Validate vé
        SELECT @TrangThaiVe = TrangThaiVe, @MaChuyenBay = MaChuyenBay
        FROM dbo.VE WITH (UPDLOCK, HOLDLOCK)
        WHERE MaVe = @MaVe AND IsDeleted = 0;

        IF @TrangThaiVe IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 6001 AS ErrorCode, N'Vé không tồn tại' AS Message;
            RETURN;
        END;

        -- Chỉ cho phép check-in vé hợp lệ (đã thanh toán)
        IF @TrangThaiVe <> 'HOP_LE'
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 6002 AS ErrorCode,
                   N'Vé không hợp lệ để check-in. Trạng thái: ' + @TrangThaiVe AS Message;
            RETURN;
        END;

        -- Kiểm tra đã check-in chưa (unique constraint trên MaVe)
        IF EXISTS (SELECT 1 FROM dbo.CHECKIN WITH (NOLOCK) WHERE MaVe = @MaVe)
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 6003 AS ErrorCode, N'Vé đã được check-in trước đó' AS Message;
            RETURN;
        END;

        -- Lấy giờ khởi hành thực tế
        SELECT @NgayGioBay = NgayGioBay
        FROM dbo.CHUYENBAY WITH (NOLOCK)
        WHERE MaChuyenBay = @MaChuyenBay;

        -- Lấy cấu hình cửa sổ check-in
        SELECT @TGMoCheckIn = TRY_CAST(ConfigValue AS INT)
        FROM dbo.APP_CONFIG WHERE ConfigKey = 'THOI_GIAN_MO_CHECKIN';
        SET @TGMoCheckIn = ISNULL(@TGMoCheckIn, 24);

        SELECT @TGDongCheckIn = TRY_CAST(ConfigValue AS INT)
        FROM dbo.APP_CONFIG WHERE ConfigKey = 'THOI_GIAN_DONG_CHECKIN';
        SET @TGDongCheckIn = ISNULL(@TGDongCheckIn, 60);

        -- Kiểm tra: chưa đến giờ mở
        IF @ThoiDiem < DATEADD(HOUR, -@TGMoCheckIn, @NgayGioBay)
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 6004 AS ErrorCode,
                   N'Chưa đến giờ mở check-in. Mở lúc: '
                   + CONVERT(VARCHAR(30), DATEADD(HOUR, -@TGMoCheckIn, @NgayGioBay), 120) AS Message;
            RETURN;
        END;

        -- Kiểm tra: đã qua giờ đóng
        IF @ThoiDiem > DATEADD(MINUTE, -@TGDongCheckIn, @NgayGioBay)
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 6005 AS ErrorCode, N'Đã đóng cửa check-in' AS Message;
            RETURN;
        END;

        -- Tạo mã boarding pass duy nhất
        SET @BoardingPassCode = 'BP' + FORMAT(@ThoiDiem, 'yyyyMMddHHmmss')
                              + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);

        -- Ghi nhận check-in
        INSERT INTO dbo.CHECKIN (MaVe, SoGhe, BoardingPassCode, CheckInAt, TrangThai)
        VALUES (@MaVe, @SoGhe, @BoardingPassCode, @ThoiDiem, 'CHECKED_IN');

        SET @MaCheckIn = SCOPE_IDENTITY();

        IF @OuterTranCount = 0 COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Check-in thành công' AS Message,
               @MaCheckIn        AS MaCheckIn,
               @BoardingPassCode AS BoardingPassCode,
               @SoGhe            AS SoGhe,
               @NgayGioBay       AS NgayGioBay;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 AND @OuterTranCount = 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
