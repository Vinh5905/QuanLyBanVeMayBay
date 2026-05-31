USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Usage: SELECT dbo.fn_KiemTraCuaSoCheckIn(@NgayGioBay, SYSUTCDATETIME())
-- Returns 1 if @ThoiDiemCheckIn is within the valid check-in window, 0 otherwise.
-- Window: [NgayGioBay - ThoiGianMoCheckInOnline h, NgayGioBay - ThoiGianDongCheckInOnline min]
-- Defaults: ThoiGianMoCheckInOnline = 24 h, ThoiGianDongCheckInOnline = 60 min.
CREATE OR ALTER FUNCTION dbo.fn_KiemTraCuaSoCheckIn
(
    @NgayGioBay      DATETIME2(0),
    @ThoiDiemCheckIn DATETIME2(0)
)
RETURNS BIT
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
    DECLARE @TGMoCheckIn   INT = 24;
    DECLARE @TGDongCheckIn INT = 60;

    SELECT @TGMoCheckIn = ISNULL(TRY_CAST(GiaTri AS INT), 24)
    FROM dbo.THAM_SO WHERE TenThamSo = 'ThoiGianMoCheckInOnline';

    SELECT @TGDongCheckIn = ISNULL(TRY_CAST(GiaTri AS INT), 60)
    FROM dbo.THAM_SO WHERE TenThamSo = 'ThoiGianDongCheckInOnline';

    IF @ThoiDiemCheckIn < DATEADD(HOUR, -@TGMoCheckIn, @NgayGioBay)
        RETURN CAST(0 AS BIT);
    IF @ThoiDiemCheckIn > DATEADD(MINUTE, -@TGDongCheckIn, @NgayGioBay)
        RETURN CAST(0 AS BIT);
    RETURN CAST(1 AS BIT);
END;
GO
