USE [$(DB_NAME)];
GO

-- Online reservation flow:
--   1. Creates PHIEUDATCHO (booking record) with TrangThaiDatCho = 'DANG_GIU_CHO'.
--   2. Also creates a linked VE with TrangThaiVe = 'DANG_GIU_CHO' so that
--      sp_ThanhToan_Create can UPDATE (not INSERT) the VE when payment arrives.
--      This is consistent with VE.MaPhieuDatCho FK and ThanhToan spec step 7.
CREATE OR ALTER PROCEDURE dbo.sp_DatVe_Create
    @MaChuyenBay  INT,
    @MaKhachHang  INT,
    @MaHangVe     INT,
    @MaPhieuDat   INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @OuterTranCount INT = @@TRANCOUNT;

    DECLARE @GiaVe           DECIMAL(18,2);
    DECLARE @SoLuong         INT;
    DECLARE @SoGheDaDat      INT;
    DECLARE @NgayGioBay      DATETIME2(0);
    DECLARE @TGDongBan       INT;
    DECLARE @ThoiHanThanhToan INT;
    DECLARE @HanThanhToan    DATETIME2(0);
    DECLARE @MaVeCode        VARCHAR(30);
    DECLARE @MaVe            INT;

    BEGIN TRY
        IF @OuterTranCount = 0 BEGIN TRANSACTION;

        -- Validate chuyến bay
        SELECT @NgayGioBay = NgayGioBay
        FROM dbo.CHUYENBAY WITH (UPDLOCK, HOLDLOCK)
        WHERE MaChuyenBay = @MaChuyenBay
          AND IsDeleted = 0
          AND TrangThaiChuyenBay NOT IN ('CANCELLED', 'DA_HUY');

        IF @NgayGioBay IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 2001 AS ErrorCode, N'Chuyến bay không tồn tại hoặc đã bị hủy' AS Message;
            RETURN;
        END;

        -- Kiểm tra thời gian đặt vé chậm nhất (kênh online dùng TGDatVeChamNhat)
        SELECT @TGDongBan = TRY_CAST(GiaTri AS INT)
        FROM dbo.THAM_SO WHERE TenThamSo = 'TGDatVeChamNhat';
        SET @TGDongBan = ISNULL(@TGDongBan, 120);

        IF DATEADD(MINUTE, -@TGDongBan, @NgayGioBay) < SYSUTCDATETIME()
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 2002 AS ErrorCode, N'Đã quá thời gian đặt vé cho chuyến bay này' AS Message;
            RETURN;
        END;

        -- Validate khách hàng
        IF NOT EXISTS (
            SELECT 1 FROM dbo.KHACHHANG
            WHERE MaKhachHang = @MaKhachHang AND IsDeleted = 0
        )
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 2003 AS ErrorCode, N'Khách hàng không tồn tại' AS Message;
            RETURN;
        END;

        -- Kiểm tra ghế với row-level lock
        SELECT @GiaVe = DonGia, @SoLuong = SoLuong, @SoGheDaDat = SoGheDaDat
        FROM dbo.CT_HANGVE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
        WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;

        IF @GiaVe IS NULL
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 2004 AS ErrorCode, N'Hạng vé không tồn tại cho chuyến bay' AS Message;
            RETURN;
        END;

        IF @SoLuong - @SoGheDaDat <= 0
        BEGIN
            IF @OuterTranCount = 0 AND @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 2005 AS ErrorCode, N'Hết ghế cho hạng vé này' AS Message;
            RETURN;
        END;

        -- Tính hạn thanh toán từ THAM_SO
        SELECT @ThoiHanThanhToan = TRY_CAST(GiaTri AS INT)
        FROM dbo.THAM_SO WHERE TenThamSo = 'ThoiHanThanhToan';
        SET @ThoiHanThanhToan = ISNULL(@ThoiHanThanhToan, 2);
        SET @HanThanhToan = DATEADD(HOUR, @ThoiHanThanhToan, SYSUTCDATETIME());

        -- Tạo phiếu đặt chỗ
        INSERT INTO dbo.PHIEUDATCHO
            (MaKhachHang, MaChuyenBay, MaHangVe, SoLuongVe, TongTien, TrangThaiDatCho, HanThanhToan)
        VALUES
            (@MaKhachHang, @MaChuyenBay, @MaHangVe, 1, @GiaVe, 'DANG_GIU_CHO', @HanThanhToan);

        SET @MaPhieuDat = SCOPE_IDENTITY();

        -- Tạo vé giữ chỗ để sp_ThanhToan_Create có thể UPDATE khi thanh toán
        SET @MaVeCode = 'VE' + FORMAT(SYSUTCDATETIME(), 'yyyyMMddHHmmss')
                      + RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(4)), 4);

        INSERT INTO dbo.VE
            (MaVeCode, MaChuyenBay, MaHangVe, MaKhachHang, MaPhieuDatCho, GiaVe, TrangThaiVe)
        VALUES
            (@MaVeCode, @MaChuyenBay, @MaHangVe, @MaKhachHang, @MaPhieuDat, @GiaVe, 'DANG_GIU_CHO');

        SET @MaVe = SCOPE_IDENTITY();

        -- Tăng số ghế đã đặt (ghế được giữ ngay khi đặt)
        UPDATE dbo.CT_HANGVE
        SET SoGheDaDat = SoGheDaDat + 1
        WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;

        IF @OuterTranCount = 0 COMMIT TRANSACTION;

        SELECT 0 AS ErrorCode, N'Đặt vé thành công' AS Message,
               @MaPhieuDat   AS MaPhieuDat,
               @MaVe         AS MaVe,
               @MaVeCode     AS MaVeCode,
               @HanThanhToan AS HanThanhToan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 AND @OuterTranCount = 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
