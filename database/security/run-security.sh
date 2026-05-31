#!/usr/bin/env bash
set -euo pipefail

SQLSERVER_HOST="${SQLSERVER_HOST:-sqlserver}"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"

if [[ ! -x "${SQLCMD}" ]]; then
  SQLCMD="/opt/mssql-tools/bin/sqlcmd"
fi

if [[ ! "${DB_NAME}" =~ ^[A-Za-z][A-Za-z0-9_]*$ ]]; then
  echo "DB_NAME contains unsupported characters." >&2
  exit 1
fi

if [[ ! "${APP_DB_USER}" =~ ^[A-Za-z][A-Za-z0-9_]*$ ]]; then
  echo "APP_DB_USER contains unsupported characters." >&2
  exit 1
fi

APP_DB_PASSWORD_SQL="${APP_DB_PASSWORD//\'/\'\'}"

sqlcmd_admin() {
  "${SQLCMD}" \
    -S "${SQLSERVER_HOST}" \
    -U sa \
    -P "${SA_PASSWORD}" \
    -C \
    -b \
    -v \
      "DB_NAME=${DB_NAME}" \
      "APP_DB_USER=${APP_DB_USER}" \
      "APP_DB_PASSWORD_SQL=${APP_DB_PASSWORD_SQL}" \
    "$@"
}

echo "Creating application login and database user if needed..."
sqlcmd_admin -i /database/init/02_create_user.sql

echo "Applying least-privilege database permissions..."
sqlcmd_admin -i /database/init/03_grant_permissions.sql

echo "Verifying application user can connect to ${DB_NAME}..."
"${SQLCMD}" \
  -S "${SQLSERVER_HOST}" \
  -U "${APP_DB_USER}" \
  -P "${APP_DB_PASSWORD}" \
  -C \
  -b \
  -d "${DB_NAME}" \
  -Q "SELECT DB_NAME() AS ApplicationDatabase;"

echo "Verifying least-privilege policy..."
sqlcmd_admin -i /database/security/99_verify_security.sql

echo "Database security initialization completed."
