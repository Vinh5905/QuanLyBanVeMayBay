#!/usr/bin/env bash
# Runs all seed SQL files in order against the SQL Server container.
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

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

for script in "${SCRIPT_DIR}"/[0-9][0-9]_seed_*.sql; do
  echo "Running seed script: $(basename "${script}")"
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

echo "Seed data loaded successfully."
