#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a; source "$PROJECT_ROOT/.env"; set +a
fi

CONTAINER_NAME="${CONTAINER_NAME:-vemaybay_sqlserver}"
DB_NAME="${DB_NAME:-VeMayBayDB}"
SA_PASSWORD="${SA_PASSWORD:?SA_PASSWORD must be set in .env}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
CONTAINER_BACKUP_DIR="/var/opt/mssql/backup"

usage() {
    echo "Usage: $0 [backup_file]"
    echo ""
    echo "  backup_file  Path to .bak file (optional, defaults to latest)"
    echo ""
    echo "Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -1t "$BACKUP_DIR"/${DB_NAME}_*.bak 2>/dev/null || echo "  (none)"
    fi
    exit 1
}

# Determine which backup file to restore
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    usage
fi

if [ -n "${1:-}" ]; then
    BACKUP_FILE="$1"
else
    BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/${DB_NAME}_*.bak 2>/dev/null | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        echo "ERROR: No backup files found in $BACKUP_DIR"
        usage
    fi
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

BACKUP_BASENAME=$(basename "$BACKUP_FILE")

echo "=== Database Restore ==="
echo "Database: $DB_NAME"
echo "Container: $CONTAINER_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""

read -p "WARNING: This will REPLACE the current database. Continue? [y/N] " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

# Ensure backup directory exists inside container
docker exec "$CONTAINER_NAME" mkdir -p "$CONTAINER_BACKUP_DIR"

# Detect sqlcmd path
SQLCMD_PATH=$(docker exec "$CONTAINER_NAME" bash -c \
    '[ -x /opt/mssql-tools18/bin/sqlcmd ] && echo /opt/mssql-tools18/bin/sqlcmd || echo /opt/mssql-tools/bin/sqlcmd')

echo ""
echo "[1/4] Copying backup file into container..."
docker cp "$BACKUP_FILE" "$CONTAINER_NAME:$CONTAINER_BACKUP_DIR/$BACKUP_BASENAME"

echo ""
echo "[2/4] Setting database to single-user mode..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -Q "IF DB_ID('$DB_NAME') IS NOT NULL ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE"

echo ""
echo "[3/4] Restoring database from backup..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -Q "RESTORE DATABASE [$DB_NAME] FROM DISK='$CONTAINER_BACKUP_DIR/$BACKUP_BASENAME' WITH REPLACE, STATS=10"

echo ""
echo "[4/4] Setting database back to multi-user mode..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -Q "ALTER DATABASE [$DB_NAME] SET MULTI_USER"

# Cleanup backup file inside container
docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_BACKUP_DIR/$BACKUP_BASENAME"

echo ""
echo "=== Restore Complete ==="
echo "Database '$DB_NAME' restored from: $BACKUP_BASENAME"
