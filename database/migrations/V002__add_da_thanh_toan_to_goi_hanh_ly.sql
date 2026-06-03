-- =====================================================
-- Migration V002: Add DaThanhToan column to GOIHANHLY
-- =====================================================
-- Adds a payment status flag to track whether a baggage
-- package has been paid.
-- =====================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.GOIHANHLY')
      AND name = N'DaThanhToan'
)
BEGIN
    ALTER TABLE dbo.GOIHANHLY
    ADD DaThanhToan BIT NOT NULL CONSTRAINT DF_GOIHANHLY_DaThanhToan DEFAULT 0;
    PRINT N'V002: Added DaThanhToan column to GOIHANHLY.';
END
ELSE
BEGIN
    PRINT N'V002: DaThanhToan column already exists in GOIHANHLY.';
END;
GO
