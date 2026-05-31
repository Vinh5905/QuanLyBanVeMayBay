ENV_FILE ?= .env.test
COMPOSE := docker compose --env-file $(ENV_FILE)

.PHONY: help config db-up db-init db-down db-logs db-status db-verify db-security-test db-sp-test db-trigger-test db-shell db-reset

help:
	@echo "Database commands:"
	@echo "  make db-up           Start SQL Server and run full initialization"
	@echo "                       (schema + security + stored procedures)"
	@echo "  make db-init         Re-run initialization (idempotent)"
	@echo "  make db-verify       Verify SQL Server and the application database"
	@echo "  make db-security-test  Run permission smoke tests"
	@echo "  make db-sp-test      Run stored procedure tests"
	@echo "  make db-trigger-test Run trigger tests"
	@echo "  make db-status       Show database containers"
	@echo "  make db-logs         Follow SQL Server logs"
	@echo "  make db-shell        Open an interactive sqlcmd session as sa"
	@echo "  make db-down         Stop containers (data persisted)"
	@echo "  make db-reset        Wipe data and re-initialize from scratch"
	@echo "  make config          Render the resolved Docker Compose configuration"
	@echo ""
	@echo "Override credentials with: make ENV_FILE=.env db-up"

config:
	$(COMPOSE) config

db-up:
	$(COMPOSE) up -d --wait sqlserver
	$(COMPOSE) run --rm sqlserver-init

db-init:
	$(COMPOSE) run --rm sqlserver-init

db-down:
	$(COMPOSE) down --remove-orphans

db-logs:
	$(COMPOSE) logs -f sqlserver

db-status:
	$(COMPOSE) ps -a

db-verify:
	$(COMPOSE) exec -T sqlserver /bin/bash /database/init/verify.sh

db-security-test:
	$(COMPOSE) run --rm --entrypoint /bin/bash sqlserver-init /database/security/test-security.sh

db-sp-test:
	$(COMPOSE) run --rm --entrypoint /bin/bash sqlserver-init /database/stored_procedures/tests/run-tests.sh

db-trigger-test:
	$(COMPOSE) run --rm --entrypoint /bin/bash sqlserver-init /database/triggers/tests/run-tests.sh

db-shell:
	$(COMPOSE) exec sqlserver /bin/bash -lc 'SQLCMD=/opt/mssql-tools18/bin/sqlcmd; [ -x "$$SQLCMD" ] || SQLCMD=/opt/mssql-tools/bin/sqlcmd; exec "$$SQLCMD" -S localhost -U sa -P "$$MSSQL_SA_PASSWORD" -C'

db-reset:
	$(COMPOSE) down -v --remove-orphans
	$(MAKE) ENV_FILE=$(ENV_FILE) db-up
