#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/database/migrations"

# Load environment variables
ENV_FILE="${ENV_FILE:-.env}"
if [ -f "$PROJECT_ROOT/$ENV_FILE" ]; then
    set -a; source "$PROJECT_ROOT/$ENV_FILE"; set +a
elif [ -f "$PROJECT_ROOT/.env" ]; then
    set -a; source "$PROJECT_ROOT/.env"; set +a
fi

CONTAINER_NAME="${CONTAINER_NAME:-vemaybay_sqlserver}"
DB_NAME="${DB_NAME:-VeMayBayDB}"
SA_PASSWORD="${SA_PASSWORD:?SA_PASSWORD must be set in .env}"

echo "=== Database Migration ==="
echo "Database: $DB_NAME"
echo "Container: $CONTAINER_NAME"
echo "Migrations dir: $MIGRATIONS_DIR"
echo ""

# Detect sqlcmd path
SQLCMD_PATH=$(docker exec "$CONTAINER_NAME" bash -c \
    '[ -x /opt/mssql-tools18/bin/sqlcmd ] && echo /opt/mssql-tools18/bin/sqlcmd || echo /opt/mssql-tools/bin/sqlcmd')

# Ensure SCHEMA_VERSION table exists
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -d "$DB_NAME" \
    -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SCHEMA_VERSION')
        CREATE TABLE SCHEMA_VERSION (
            Version VARCHAR(10) NOT NULL PRIMARY KEY,
            Description NVARCHAR(500) NOT NULL,
            AppliedAt DATETIME NOT NULL DEFAULT GETDATE(),
            AppliedBy NVARCHAR(128) NOT NULL DEFAULT SYSTEM_USER
        );" -b

# Get list of applied versions
APPLIED=$(docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -d "$DB_NAME" -h -1 -W \
    -Q "SET NOCOUNT ON; SELECT Version FROM SCHEMA_VERSION ORDER BY Version")

echo "Applied versions:"
if [ -z "$APPLIED" ]; then
    echo "  (none)"
else
    echo "$APPLIED" | while read -r v; do echo "  $v"; done
fi
echo ""

# Run pending migrations in order
PENDING=0
for migration_file in "$MIGRATIONS_DIR"/V*.sql; do
    [ -f "$migration_file" ] || continue
    filename=$(basename "$migration_file")
    version=$(echo "$filename" | grep -oE '^V[0-9]+' )

    if echo "$APPLIED" | grep -qw "$version"; then
        continue
    fi

    PENDING=$((PENDING + 1))
    echo "Applying: $filename..."
    docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
        -S localhost -U sa -P "$SA_PASSWORD" -C \
        -d "$DB_NAME" -v "DB_NAME=$DB_NAME" -i "/database/migrations/$filename" -b

    description="${filename#${version}__}"
    description="${description%.sql}"
    description="${description//_/ }"
    docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
        -S localhost -U sa -P "$SA_PASSWORD" -C \
        -d "$DB_NAME" \
        -v "Version=$version" "Description=$description" \
        -Q "IF NOT EXISTS (SELECT 1 FROM SCHEMA_VERSION WHERE Version = N'\$(Version)')
            INSERT INTO SCHEMA_VERSION (Version, Description)
            VALUES (N'\$(Version)', N'\$(Description)');" -b
    echo "  Done."
done

if [ "$PENDING" -eq 0 ]; then
    echo "Database is up to date. No pending migrations."
else
    echo ""
    echo "=== Migration Complete ==="
    echo "Applied $PENDING migration(s)."
fi
