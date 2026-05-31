USE [$(DB_NAME)];
GO

SET NOCOUNT ON;

IF SUSER_ID(N'$(APP_DB_USER)') IS NULL
BEGIN
    THROW 52000, 'Security verification failed: application login is missing.', 1;
END;

IF DATABASE_PRINCIPAL_ID(N'$(APP_DB_USER)') IS NULL
BEGIN
    THROW 52001, 'Security verification failed: application database user is missing.', 1;
END;

EXECUTE AS USER = '$(APP_DB_USER)';

DECLARE @CanSelectTicket INT = HAS_PERMS_BY_NAME(N'dbo.VE', N'OBJECT', N'SELECT');
DECLARE @CanUpdateTicket INT = HAS_PERMS_BY_NAME(N'dbo.VE', N'OBJECT', N'UPDATE');
DECLARE @CanDeleteTicket INT = HAS_PERMS_BY_NAME(N'dbo.VE', N'OBJECT', N'DELETE');
DECLARE @CanInsertAuditLog INT = HAS_PERMS_BY_NAME(N'dbo.AUDIT_LOG', N'OBJECT', N'INSERT');
DECLARE @CanUpdateAuditLog INT = HAS_PERMS_BY_NAME(N'dbo.AUDIT_LOG', N'OBJECT', N'UPDATE');
DECLARE @CanDeleteRefreshToken INT = HAS_PERMS_BY_NAME(N'dbo.REFRESH_TOKEN', N'OBJECT', N'DELETE');
DECLARE @CanCreateTable INT = HAS_PERMS_BY_NAME(DB_NAME(), N'DATABASE', N'CREATE TABLE');
DECLARE @CanAlterSchema INT = HAS_PERMS_BY_NAME(N'dbo', N'SCHEMA', N'ALTER');
DECLARE @CanExecuteProcedure INT = HAS_PERMS_BY_NAME(N'dbo', N'SCHEMA', N'EXECUTE');

REVERT;

IF @CanSelectTicket <> 1 OR @CanUpdateTicket <> 1
    THROW 52002, 'Security verification failed: ticket read/write permissions are incomplete.', 1;
IF @CanDeleteTicket <> 0
    THROW 52003, 'Security verification failed: application user must not hard-delete tickets.', 1;
IF @CanInsertAuditLog <> 1 OR @CanUpdateAuditLog <> 0
    THROW 52004, 'Security verification failed: audit log permissions are invalid.', 1;
IF @CanDeleteRefreshToken <> 1
    THROW 52005, 'Security verification failed: refresh-token cleanup permission is missing.', 1;
IF @CanCreateTable <> 0 OR @CanAlterSchema <> 0
    THROW 52006, 'Security verification failed: application user has DDL permissions.', 1;
IF @CanExecuteProcedure <> 1
    THROW 52007, 'Security verification failed: stored-procedure execution permission is missing.', 1;

PRINT 'Security verification passed: application user follows the least-privilege policy.';
GO
