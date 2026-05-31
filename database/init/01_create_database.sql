IF DB_ID(N'$(DB_NAME)') IS NULL
BEGIN
    DECLARE @CreateDatabaseSql NVARCHAR(MAX) =
        N'CREATE DATABASE ' + QUOTENAME(N'$(DB_NAME)');

    EXEC sys.sp_executesql @CreateDatabaseSql;
END;
GO
