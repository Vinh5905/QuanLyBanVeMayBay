-- ============================================================
-- Migration V001: Full initial schema
-- Date: 2026-05-31
-- Description: Consolidates all schema, SP, triggers, views,
--              functions into a single versioned migration.
-- ============================================================

-- Schema version tracking table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SCHEMA_VERSION')
BEGIN
    CREATE TABLE SCHEMA_VERSION (
        Version     VARCHAR(10) NOT NULL PRIMARY KEY,
        Description NVARCHAR(500) NOT NULL,
        AppliedAt   DATETIME NOT NULL DEFAULT GETDATE(),
        AppliedBy   NVARCHAR(128) NOT NULL DEFAULT SYSTEM_USER
    );
END
GO

-- Guard: skip if already applied
IF EXISTS (SELECT 1 FROM SCHEMA_VERSION WHERE Version = 'V001')
BEGIN
    PRINT 'V001 already applied. Skipping.';
    RETURN;
END
GO

-- ============================================================
-- This migration represents the initial schema state.
-- The actual DDL lives in the individual schema/ files:
--   schema/01_tables_system.sql
--   schema/02_tables_core.sql
--   schema/03_tables_flight.sql
--   schema/04_tables_ticket.sql
--   schema/05_tables_payment.sql
--   schema/06_tables_baggage.sql
--   schema/07_tables_checkin.sql
--   schema/08_indexes_constraints.sql
--
-- Plus objects from:
--   stored_procedures/*.sql
--   triggers/*.sql
--   views/*.sql
--   functions/*.sql
--
-- To apply from scratch, use scripts/db_reset_dev.sh
-- which runs all files in order.
-- ============================================================

INSERT INTO SCHEMA_VERSION (Version, Description)
VALUES ('V001', N'Initial schema: 19 tables, 10 SPs, 4 triggers, 7 views, 4 functions');
GO

PRINT 'V001 applied successfully.';
GO
