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

for script in /database/schema/*.sql; do
  echo "Running schema script: $(basename "${script}")"
  "${SQLCMD}" \
    -S "${SQLSERVER_HOST}" \
    -U sa \
    -P "${SA_PASSWORD}" \
    -C \
    -b \
    -d "${DB_NAME}" \
    -v "DB_NAME=${DB_NAME}" \
    -i "${script}"
done

echo "Schema initialization completed."
