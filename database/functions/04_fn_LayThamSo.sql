USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Usage: SELECT dbo.fn_LayThamSo('ThueVAT')
-- Returns THAM_SO.GiaTri for the given key, or NULL if not found.
-- Performance: avoid in SELECT over large result sets; cache at the backend layer instead.
CREATE OR ALTER FUNCTION dbo.fn_LayThamSo
(
    @TenThamSo  VARCHAR(100)
)
RETURNS NVARCHAR(500)
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
    DECLARE @Val NVARCHAR(500);
    SELECT @Val = GiaTri FROM dbo.THAM_SO WHERE TenThamSo = @TenThamSo;
    RETURN @Val;
END;
GO
