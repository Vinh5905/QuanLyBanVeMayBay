USE [$(DB_NAME)];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Usage: SELECT dbo.fn_LayThamSo('THUE_VAT')
-- Returns APP_CONFIG.ConfigValue for the given key, or NULL if not found.
-- Performance: avoid in SELECT over large result sets; cache at the backend layer instead.
CREATE OR ALTER FUNCTION dbo.fn_LayThamSo
(
    @ConfigKey  VARCHAR(100)
)
RETURNS NVARCHAR(500)
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
    DECLARE @Val NVARCHAR(500);
    SELECT @Val = ConfigValue FROM dbo.APP_CONFIG WHERE ConfigKey = @ConfigKey;
    RETURN @Val;
END;
GO
