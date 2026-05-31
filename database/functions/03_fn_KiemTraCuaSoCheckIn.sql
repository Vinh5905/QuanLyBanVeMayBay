USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Usage: SELECT dbo.fn_KiemTraCuaSoCheckIn(@NgayGioBay, SYSUTCDATETIME())
-- Returns 1 if @ThoiDiemCheckIn is within the valid check-in window, 0 otherwise.
-- Window: [NgayGioBay - THOI_GIAN_MO_CHECKIN h, NgayGioBay - THOI_GIAN_DONG_CHECKIN min]
-- Defaults: THOI_GIAN_MO_CHECKIN = 24 h, THOI_GIAN_DONG_CHECKIN = 60 min.
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

    SELECT @TGMoCheckIn = ISNULL(TRY_CAST(ConfigValue AS INT), 24)
    FROM dbo.APP_CONFIG WHERE ConfigKey = 'THOI_GIAN_MO_CHECKIN';

    SELECT @TGDongCheckIn = ISNULL(TRY_CAST(ConfigValue AS INT), 60)
    FROM dbo.APP_CONFIG WHERE ConfigKey = 'THOI_GIAN_DONG_CHECKIN';

    IF @ThoiDiemCheckIn < DATEADD(HOUR, -@TGMoCheckIn, @NgayGioBay)
        RETURN CAST(0 AS BIT);
    IF @ThoiDiemCheckIn > DATEADD(MINUTE, -@TGDongCheckIn, @NgayGioBay)
        RETURN CAST(0 AS BIT);
    RETURN CAST(1 AS BIT);
END;
GO
