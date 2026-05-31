## Issue

<!--
Required. Use the real GitHub issue number, not the roadmap task code.
Example: Closes #12

Use one line per issue only if this PR fully completes each issue:
Closes #12
Closes #18

Use Refs #12 instead if this PR only relates to or partially addresses an issue.
-->
Closes #<!-- issue number -->

## Roadmap Task

<!-- Example: BE-05 - API Bán vé & Đặt vé -->

## Branch

<!-- Example: feat/be-05-ticket-booking-api -->

## Changed Files

<!--
List every file added, modified or deleted.
Example:
- src/main/java/com/example/ticket/TicketController.java
- src/main/resources/db/migration/V002__create_ticket_tables.sql
-->

## What Changed

<!--
Describe the main changes as a bullet list.
Example:
- Added ticket booking endpoint.
- Added validation to prevent overselling seats.
- Added integration tests for successful and rejected bookings.
-->

## Public API / Database Contract For Other Contributors

<!--
Document any endpoint, public class or method, database object, migration or config
that other contributors need to use. Leave blank if there is no shared contract.

Example:
- `POST /api/tickets/bookings` - create a ticket reservation.
- `sp_DatVe_Create` - call this procedure instead of inserting reservations directly.
-->

## Breaking Changes

<!--
Document renamed, removed or incompatible behavior that may affect other work.
Leave blank if there is no breaking change.

Example:
BREAKING CHANGE: Renamed response field `flightCode` to `code`.
Consumers of the flight search API must update their mapping.
-->

## Security / Configuration Notes

<!--
Mention new environment variables, permissions, migration order or security impact.
Never include real secrets. Leave blank if there is nothing to note.

Example:
- Added `JWT_ACCESS_TOKEN_EXPIRATION`. Update `.env` from `.env.example`.
-->

## Notes For Other Contributors

<!--
Mention dependencies, follow-up work or details contributors should know.
Leave blank if there is nothing to note.
-->

## Test / Demo

<!--
Describe exactly how this was verified.
Example:
- Ran `mvn test` - all tests pass.
- Ran `docker-compose up` and confirmed SQL Server healthcheck passes.
- Manually called `POST /api/tickets/bookings` and confirmed seat count decreases.
-->

## Checklist

- [ ] The PR title follows `<type>(<scope>): <short-description> [<roadmap-id>]`.
- [ ] The PR is limited to the linked issue scope.
- [ ] I listed every changed file.
- [ ] I documented shared API, database and configuration changes.
- [ ] I did not commit secrets or a real `.env` file.
- [ ] I ran the relevant test, build or manual demo steps.
