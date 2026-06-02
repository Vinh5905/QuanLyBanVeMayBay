#!/usr/bin/env bash
# Runs all SP test files against the SQL Server container.
# Each test file uses BEGIN TRAN / ROLLBACK so no test data persists.
# Exit code is non-zero if any test fails (sqlcmd -b flag propagates RAISERROR).
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
PASS=0
FAIL=0

run_sql() {
  local file="$1"
  echo "--- Running: $(basename "${file}") ---"
  if "${SQLCMD}" \
      -S "${SQLSERVER_HOST}" \
      -U sa \
      -P "${SA_PASSWORD}" \
      -C \
      -b \
      -d "${DB_NAME}" \
      -v "DB_NAME=${DB_NAME}" \
      -i "${file}"; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAILED: $(basename "${file}")" >&2
  fi
}

# Load test helpers (APP_CONFIG values) first
run_sql "${SCRIPT_DIR}/00_helpers.sql"

# Run all numbered test files
for script in "${SCRIPT_DIR}"/[0-9][0-9]_test_*.sql; do
  run_sql "${script}"
done

echo ""
echo "==================================="
echo " Test results: ${PASS} passed, ${FAIL} failed"
echo "==================================="

[[ ${FAIL} -eq 0 ]]
