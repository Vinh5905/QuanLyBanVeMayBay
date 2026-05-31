USE [$(DB_NAME)];
GO

-- Verify all 10 stored procedures exist and are executable
DECLARE @Missing TABLE (ProcName VARCHAR(100));

INSERT INTO @Missing (ProcName)
SELECT expected.name
FROM (VALUES
    ('sp_AuditLog_Insert'),
    ('sp_BanVe_Create'),
    ('sp_DatVe_Create'),
    ('sp_ThanhToan_Create'),
    ('sp_HuyVe'),
    ('sp_DoiChuyenBay'),
    ('sp_CheckIn_Online'),
    ('sp_HuyDatCho_Auto'),
    ('sp_Report_DoanhThuThang'),
    ('sp_Report_DoanhThuNam')
) AS expected(name)
WHERE NOT EXISTS (
    SELECT 1 FROM sys.procedures
    WHERE name       = expected.name
      AND schema_id  = SCHEMA_ID('dbo')
);

IF EXISTS (SELECT 1 FROM @Missing)
BEGIN
    SELECT 'MISSING' AS Status, ProcName FROM @Missing;
    RAISERROR(N'One or more stored procedures are missing. See result set above.', 16, 1);
END
ELSE
BEGIN
    SELECT 'OK' AS Status, name AS ProcName
    FROM sys.procedures
    WHERE schema_id = SCHEMA_ID('dbo')
      AND name IN (
          'sp_AuditLog_Insert',
          'sp_BanVe_Create',
          'sp_DatVe_Create',
          'sp_ThanhToan_Create',
          'sp_HuyVe',
          'sp_DoiChuyenBay',
          'sp_CheckIn_Online',
          'sp_HuyDatCho_Auto',
          'sp_Report_DoanhThuThang',
          'sp_Report_DoanhThuNam'
      )
    ORDER BY name;

    PRINT N'All stored procedures verified OK.';
END;
GO
