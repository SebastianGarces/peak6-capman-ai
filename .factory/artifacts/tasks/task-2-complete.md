# Task 2: Docker Compose for PostgreSQL + pgvector — COMPLETE

## Files Created/Modified

- `docker-compose.yml` (created)
- `.env.local` (created)
- `.env.example` (created)
- `.gitignore` (created)

## Tests

All acceptance criteria verified manually via docker compose and psql:

1. `docker compose config` — validates without errors
2. `docker compose up -d` — container starts successfully
3. Healthcheck passes: `pg_isready -U capman` returns healthy status
4. `psql -U capman -d capman_dev -c "SELECT 1"` — returns 1 (connection works)
5. `CREATE EXTENSION IF NOT EXISTS vector` — succeeds (pgvector 0.8.2 installed)

## Acceptance Criteria

- [x] AC1: `docker compose up -d` starts PostgreSQL container — verified, container running (healthy)
- [x] AC2: `pg_isready` healthcheck passes — verified, container status shows (healthy)
- [x] AC3: pgvector extension available — verified, `CREATE EXTENSION vector` succeeds, extversion=0.8.2
- [x] AC4: DATABASE_URL connects — verified, `psql -c "SELECT 1"` returns 1
- [x] AC5: Container uses `pgvector/pgvector:pg17` image — confirmed in docker-compose.yml and `docker compose ps`
- [x] AC6: Data persists across restarts — named volume `postgres_data` configured

## Notes

**Port deviation**: Port 5432 was already allocated by another Docker container (`skyfi-verify-db-1`) running on the host. The capman database uses port **5433** on the host (maps to 5432 inside the container). The DATABASE_URL in `.env.local` and `.env.example` has been updated accordingly:

```
DATABASE_URL=postgresql://capman:capman_local@localhost:5433/capman_dev
```

This does not affect the container-internal port (still 5432). Subsequent tasks that connect from within Docker should use the service name `db:5432`. Tasks connecting from the host (e.g., drizzle-kit migrations in Task 3/4) should use `localhost:5433`.

The database is left running as required for subsequent tasks.
