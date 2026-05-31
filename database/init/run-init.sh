#!/usr/bin/env bash
set -euo pipefail

SQLSERVER_HOST="${SQLSERVER_HOST:-sqlserver}"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"

if [[ ! -x "${SQLCMD}" ]]; then
  SQLCMD="/opt/mssql-tools/bin/sqlcmd"
fi

if [[ ! -x "${SQLCMD}" ]]; then
  echo "sqlcmd was not found in the SQL Server image." >&2
  exit 1
fi

sqlcmd_admin() {
  "${SQLCMD}" \
    -S "${SQLSERVER_HOST}" \
    -U sa \
    -P "${SA_PASSWORD}" \
    -C \
    -b \
    "$@"
}

echo "Waiting for SQL Server at ${SQLSERVER_HOST}..."
for attempt in {1..30}; do
  if sqlcmd_admin -Q "SELECT 1" >/dev/null 2>&1; then
    break
  fi

  if [[ "${attempt}" == "30" ]]; then
    echo "SQL Server did not become ready in time." >&2
    exit 1
  fi

  sleep 2
done

echo "Creating application database if needed..."
sqlcmd_admin \
  -v "DB_NAME=${DB_NAME}" \
  -i /database/init/01_create_database.sql

echo "Database initialization completed."
