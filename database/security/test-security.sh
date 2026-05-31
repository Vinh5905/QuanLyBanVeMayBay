#!/usr/bin/env bash
set -euo pipefail

SQLSERVER_HOST="${SQLSERVER_HOST:-sqlserver}"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
PROBE_DATABASE="PermissionProbeDB"

if [[ ! -x "${SQLCMD}" ]]; then
  SQLCMD="/opt/mssql-tools/bin/sqlcmd"
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

sqlcmd_app() {
  "${SQLCMD}" \
    -S "${SQLSERVER_HOST}" \
    -U "${APP_DB_USER}" \
    -P "${APP_DB_PASSWORD}" \
    -C \
    -b \
    "$@"
}

drop_probe_database() {
  sqlcmd_admin -Q "
    IF DB_ID(N'${PROBE_DATABASE}') IS NOT NULL
    BEGIN
        ALTER DATABASE [${PROBE_DATABASE}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${PROBE_DATABASE}];
    END;
  " >/dev/null
}

expect_app_denied() {
  local description="$1"
  shift

  if sqlcmd_app "$@" >/tmp/vemaybay-security-test.log 2>&1; then
    echo "FAIL: application user was unexpectedly allowed to ${description}." >&2
    cat /tmp/vemaybay-security-test.log >&2
    exit 1
  fi

  echo "PASS: application user cannot ${description}."
}

trap drop_probe_database EXIT

drop_probe_database
sqlcmd_admin -Q "CREATE DATABASE [${PROBE_DATABASE}];" >/dev/null

expect_app_denied \
  "connect to another user database" \
  -d "${PROBE_DATABASE}" \
  -Q "SELECT DB_NAME();"

expect_app_denied \
  "create tables" \
  -d "${DB_NAME}" \
  -Q "CREATE TABLE dbo.PERMISSION_PROBE (Id INT NOT NULL);"

expect_app_denied \
  "hard-delete tickets" \
  -d "${DB_NAME}" \
  -Q "DELETE FROM dbo.VE WHERE 1 = 0;"

expect_app_denied \
  "update audit logs" \
  -d "${DB_NAME}" \
  -Q "UPDATE dbo.AUDIT_LOG SET TenBang = TenBang WHERE 1 = 0;"

echo "Database security smoke tests passed."
