#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_ROOT/database"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a; source "$PROJECT_ROOT/.env"; set +a
fi

CONTAINER_NAME="${CONTAINER_NAME:-vemaybay_sqlserver}"
DB_NAME="${DB_NAME:-VeMayBayDB}"
SA_PASSWORD="${SA_PASSWORD:?SA_PASSWORD must be set in .env}"
APP_DB_USER="${APP_DB_USER:-vemaybay_app}"
APP_DB_PASSWORD="${APP_DB_PASSWORD:?APP_DB_PASSWORD must be set in .env}"

echo "=== Database Reset (DEV ONLY) ==="
echo "Database: $DB_NAME"
echo "Container: $CONTAINER_NAME"
echo ""
echo "WARNING: This will DROP and recreate the entire database."
echo "All data will be LOST. Only use in development."
echo ""

read -p "Are you sure? Type 'reset' to confirm: " confirm
if [ "$confirm" != "reset" ]; then
    echo "Aborted."
    exit 0
fi

# Detect sqlcmd path
SQLCMD_PATH=$(docker exec "$CONTAINER_NAME" bash -c \
    '[ -x /opt/mssql-tools18/bin/sqlcmd ] && echo /opt/mssql-tools18/bin/sqlcmd || echo /opt/mssql-tools/bin/sqlcmd')

run_sql() {
    local file="$1"
    local desc="${2:-$file}"
    echo "  Running: $desc"
    docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
        -S localhost -U sa -P "$SA_PASSWORD" -C \
        -d "$DB_NAME" -i "/database/$file" -b
}

run_sql_master() {
    local file="$1"
    local desc="${2:-$file}"
    echo "  Running: $desc"
    docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
        -S localhost -U sa -P "$SA_PASSWORD" -C \
        -d master -i "/database/$file" -b
}

echo ""
echo "[1/6] Dropping database $DB_NAME..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -Q "IF DB_ID('$DB_NAME') IS NOT NULL BEGIN ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$DB_NAME]; END"

echo ""
echo "[2/6] Running init scripts (create DB, user, permissions)..."
run_sql_master "init/01_create_database.sql" "Create database"

docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -d "$DB_NAME" \
    -Q "IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = '$APP_DB_USER')
        CREATE LOGIN [$APP_DB_USER] WITH PASSWORD = '$APP_DB_PASSWORD';
        IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = '$APP_DB_USER')
        CREATE USER [$APP_DB_USER] FOR LOGIN [$APP_DB_USER];"

run_sql "init/03_grant_permissions.sql" "Grant permissions"

echo ""
echo "[3/6] Running schema scripts..."
for f in schema/01_tables_system.sql \
         schema/02_tables_core.sql \
         schema/03_tables_flight.sql \
         schema/04_tables_ticket.sql \
         schema/05_tables_payment.sql \
         schema/06_tables_baggage.sql \
         schema/07_tables_checkin.sql \
         schema/08_indexes_constraints.sql; do
    run_sql "$f"
done

echo ""
echo "[4/6] Running stored procedures, triggers, views, functions..."
for f in stored_procedures/*.sql; do
    basename_f=$(basename "$f")
    [[ "$basename_f" == 99_* ]] && continue
    [[ "$basename_f" == README* ]] && continue
    run_sql "stored_procedures/$basename_f"
done

for f in triggers/*.sql; do
    basename_f=$(basename "$f")
    [[ "$basename_f" == 99_* ]] && continue
    run_sql "triggers/$basename_f"
done

for f in views/*.sql; do
    basename_f=$(basename "$f")
    [[ "$basename_f" == 99_* ]] && continue
    run_sql "views/$basename_f"
done

for f in functions/*.sql; do
    basename_f=$(basename "$f")
    [[ "$basename_f" == 99_* ]] && continue
    run_sql "functions/$basename_f"
done

echo ""
echo "[5/6] Running seed data..."
for f in seed/01_seed_system.sql \
         seed/02_seed_airports.sql \
         seed/03_seed_customers.sql \
         seed/04_seed_flights.sql \
         seed/05_seed_tickets.sql \
         seed/06_seed_payments.sql \
         seed/07_seed_baggage.sql \
         seed/08_seed_checkin.sql \
         seed/09_seed_auditlogs.sql; do
    run_sql "$f"
done

echo ""
echo "[6/6] Verifying reset..."
docker exec "$CONTAINER_NAME" "$SQLCMD_PATH" \
    -S localhost -U sa -P "$SA_PASSWORD" -C \
    -d "$DB_NAME" \
    -Q "SELECT COUNT(*) AS TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"

echo ""
echo "=== Reset Complete ==="
echo "Database '$DB_NAME' has been recreated with schema and seed data."
