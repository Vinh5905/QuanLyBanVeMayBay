SELECT @@VERSION AS SqlServerVersion;
SELECT DB_ID(N'$(DB_NAME)') AS ApplicationDatabaseId;
GO
