USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Usage: SELECT dbo.fn_TinhPhiHangLy(20.0, SYSUTCDATETIME(), @MaChuyenBay)
-- Selects the smallest active BANGGIA_HANHLY tier where TrongLuongToiDa >= @TongTrongLuong.
-- Returns GiaMuaTruoc when @ThoiDiemMua < (NgayGioBay - THOI_GIAN_MUA_TRUOC_HANHLY hours),
--         GiaTaiSanBay otherwise. NULL if no matching active tier or flight not found.
CREATE OR ALTER FUNCTION dbo.fn_TinhPhiHangLy
(
    @TongTrongLuong  DECIMAL(6,2),
    @ThoiDiemMua     DATETIME2(0),
    @MaChuyenBay     INT
)
RETURNS DECIMAL(18,2)
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
    DECLARE @NgayGioBay     DATETIME2(0);
    DECLARE @NguongGio      INT = 3;
    DECLARE @GiaMuaTruoc    DECIMAL(18,2);
    DECLARE @GiaTaiSanBay   DECIMAL(18,2);

    SELECT @NgayGioBay = NgayGioBay
    FROM dbo.CHUYENBAY
    WHERE MaChuyenBay = @MaChuyenBay AND IsDeleted = 0;

    IF @NgayGioBay IS NULL RETURN NULL;

    SELECT @NguongGio = ISNULL(TRY_CAST(ConfigValue AS INT), 3)
    FROM dbo.APP_CONFIG
    WHERE ConfigKey = 'THOI_GIAN_MUA_TRUOC_HANHLY';

    SELECT TOP 1
        @GiaMuaTruoc  = GiaMuaTruoc,
        @GiaTaiSanBay = GiaTaiSanBay
    FROM dbo.BANGGIA_HANHLY
    WHERE TrongLuongToiDa >= @TongTrongLuong AND IsActive = 1
    ORDER BY TrongLuongToiDa ASC;

    IF @GiaMuaTruoc IS NULL RETURN NULL;

    RETURN CASE
        WHEN @ThoiDiemMua < DATEADD(HOUR, -@NguongGio, @NgayGioBay)
            THEN @GiaMuaTruoc
        ELSE @GiaTaiSanBay
    END;
END;
GO
