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
MAX_BACKUPS="${MAX_BACKUPS:-5}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="${DB_NAME}_${TIMESTAMP}.bak"
CONTAINER_BACKUP_DIR="/var/opt/mssql/backup"

echo "=== Database Backup ==="
echo "Database: $DB_NAME"
echo "Container: $CONTAINER_NAME"
echo "Timestamp: $TIMESTAMP"
echo ""

# Ensure local backup directory exists
mkdir -p "$BACKUP_DIR"

# Ensure backup directory exists inside container
docker exec "$CONTAINER_NAME" mkdir -p "$CONTAINER_BACKUP_DIR"

# Detect sqlcmd path
SQLCMD_PATH=$(docker exec "$CONTAINER_NAME" bash -c \
    '[ -x /opt/mssql-tools18/bin/sqlcmd ] && echo /opt/mssql-tools18/bin/sqlcmd || echo /opt/mssql-tools/bin/sqlcmd')

echo "[1/4] Creating backup inside container..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -Q "BACKUP DATABASE [$DB_NAME] TO DISK='$CONTAINER_BACKUP_DIR/$BACKUP_FILENAME' WITH FORMAT, INIT, COMPRESSION, STATS=10"

echo ""
echo "[2/4] Copying backup to host: $BACKUP_DIR/$BACKUP_FILENAME"
docker cp "$CONTAINER_NAME:$CONTAINER_BACKUP_DIR/$BACKUP_FILENAME" "$BACKUP_DIR/$BACKUP_FILENAME"

echo ""
echo "[3/4] Cleaning up backup inside container..."
docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_BACKUP_DIR/$BACKUP_FILENAME"

echo ""
echo "[4/4] Rotating old backups (keeping latest $MAX_BACKUPS)..."
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1 ${DB_NAME}_*.bak 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -1t ${DB_NAME}_*.bak | tail -n "$REMOVE_COUNT" | while read -r old_backup; do
        echo "  Removing old backup: $old_backup"
        rm -f "$old_backup"
    done
fi

echo ""
echo "=== Backup Complete ==="
echo "File: $BACKUP_DIR/$BACKUP_FILENAME"
echo "Size: $(ls -lh "$BACKUP_DIR/$BACKUP_FILENAME" | awk '{print $5}')"
echo "Backups kept: $(ls -1 ${DB_NAME}_*.bak 2>/dev/null | wc -l)/$MAX_BACKUPS"
