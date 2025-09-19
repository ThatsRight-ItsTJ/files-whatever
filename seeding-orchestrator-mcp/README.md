# Seeding Orchestrator MCP Wrapper (FastAPI)

This scaffold provides a single MCP HTTP endpoint that attempts to run a project's seed workflow
across common stacks: **Prisma**, **Django (manage.py / loaddata / custom seeds)**, and **Alembic** (SQLAlchemy migrations).

Endpoints:
- `POST /mcp/seed` - Run seed for a project. Accepts JSON payload (see examples).

Features (scaffold):
- Auto-detects project type by looking for `prisma/schema.prisma`, `manage.py`, `alembic.ini`.
- Executes standard seed commands:
  - Prisma: `npx prisma db seed` (requires Node + npm/npx available)
  - Django: `python manage.py migrate` then optional `python manage.py loaddata <fixtures>` or `python manage.py seed` if provided.
  - Alembic: `alembic upgrade head` (requires alembic installed & configured)
- Merges environment variables provided in the request with server env for command execution.
- Captures stdout/stderr and returns a normalized JSON result per runner.

Quickstart (development):
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

Example request payloads:
```bash
# Auto-detect and run seed
curl -X POST http://localhost:8080/mcp/seed -H "Content-Type: application/json" -d '{
  "project_path": "/path/to/repo",
  "env": {"DATABASE_URL": "postgres://user:pass@db:5432/dbname"}
}'

# Force Prisma
curl -X POST http://localhost:8080/mcp/seed -H "Content-Type: application/json" -d '{
  "project_path": "/path/to/repo",
  "project_type": "prisma",
  "env": {"DATABASE_URL": "postgres://user:pass@db:5432/dbname"}
}'

# Django with fixtures
curl -X POST http://localhost:8080/mcp/seed -H "Content-Type: application/json" -d '{
  "project_path": "/path/to/repo",
  "project_type": "django",
  "fixtures": ["initial_data.json"]
}'
```

Notes & production considerations:
- The container must have Node.js installed to run Prisma seed (`npx prisma db seed`). In production, you may prefer to run a Node-based container for Prisma operations or ensure Node is installed in the image.
- For Django and Alembic, ensure the Python environment within the container has the required packages installed (Django, alembic, SQLAlchemy, etc.). You can mount your project's virtualenv or run this orchestrator in the same environment.
- Add authentication and access controls before exposing this to the public internet.
