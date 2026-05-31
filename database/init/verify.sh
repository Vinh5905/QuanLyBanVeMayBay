#!/usr/bin/env bash
set -euo pipefail

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"

if [[ ! -x "${SQLCMD}" ]]; then
  SQLCMD="/opt/mssql-tools/bin/sqlcmd"
fi

"${SQLCMD}" \
  -S localhost \
  -U sa \
  -P "${MSSQL_SA_PASSWORD}" \
  -C \
  -b \
  -v "DB_NAME=${DB_NAME:-VeMayBayDB}" \
  -i /database/init/verify.sql
