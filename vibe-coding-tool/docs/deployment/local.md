# Local Deployment

Local deployment is ideal for development and testing, using Docker Compose for the full stack (orchestrator, DB, queue). This setup runs everything on your machine without external dependencies. For production, see [Production Deployment](production.md).

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+.
- Environment variables configured (see [Installation](../getting-started/installation.md#environment-variables)).
- Ports free: 5432 (DB), 6379 (Redis), 8000 (API), 3000 (Frontend, separate).

## Docker Compose Setup

The orchestrator includes docker-compose.yml for local services.

1. **Copy Environment**:
   ```
   cd vibe-coding-tool/orchestrator
   cp .env.example .env
   ```
   - Edit .env with local values (DATABASE_URL, REDIS_URL, secrets).
   - For frontend: .env.local with NEXT_PUBLIC_API_URL=http://host.docker.internal:8000.

2. **Start Services**:
   ```
   docker compose up -d
   ```
   - Starts: app (FastAPI), postgres, redis.
   - Minimal: `docker compose -f docker-compose.minimal.yml up -d` (no extras).
   - Full: Includes monitoring (Prometheus on 9090).

3. **Run Migrations**:
   ```
   docker compose exec app alembic upgrade head
   ```
   - Ensures DB schema up to date.

4. **Verify Services**:
   - Backend: `curl http://localhost:8000/health` → {"status": "healthy"}.
   - Logs: `docker compose logs -f app` for errors.
   - DB: `docker compose exec postgres psql -l` to list databases.

5. **Frontend** (Separate Container or Local):
   - Local: `cd .. && npm run dev` (connects to localhost:8000).
   - Docker: Build and run separately, update NEXT_PUBLIC_API_URL to host.docker.internal:8000.

6. **MCP Local Testing**:
   - For light MCPs (e.g., GitHub wrapper): `docker run -p 8080:8000 github-file-seek-mcp-wrapper`.
   - Update registry if needed, but local MCPs can run alongside.

## Environment Config

Key .env for local:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/vibe_coding_tool
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=dev-secret  # Use secure for prod
GITHUB_CLIENT_ID=dev-github-id
# OAuth redirects: http://localhost:3000/auth/...
DEBUG=true
LOG_LEVEL=DEBUG
ENABLE_METRICS=true
```

For local DB without Docker: Install postgres/redis locally, update URL.

## Running Services

- **Full Stack**:
  ```
  docker compose up -d
  ```
  - App: localhost:8000
  - Frontend: Run separately or add to compose (see docker-compose.simple.yml).

- **Stop/Clean**:
  ```
  docker compose down
  docker compose down -v  # Remove volumes for fresh start
  ```

- **Logs and Debug**:
  - App logs: `docker compose logs app`.
  - DB: `docker compose logs postgres`.
  - Exec: `docker compose exec app bash` for shell access.

## Local MCP Deployment

For testing custom MCPs locally:

1. **Build and Run**:
   ```
   cd hfspace-worker-template/worker
   docker build -t local-mcp .
   docker run -p 7860:7860 -e HF_TOKEN=your_token local-mcp
   ```

2. **Update Registry**:
   - In orchestrator .env or config: Add local URL to metamcp_registry.json.
   - Restart app: `docker compose restart app`.

3. **Test**:
   - curl http://localhost:7860/health
   - Use in task: Ensure capabilities match.

For full local stack, extend docker-compose.yml with MCP containers.

## Troubleshooting Local

- **Port Conflicts**: Change ports in docker-compose.yml.
- **DB Connection**: Ensure postgres container up first.
- **Slow Start**: Increase Docker resources (4GB+ RAM).

For production scaling: [Production](production.md). HF MCPs: [HF Spaces](hf-spaces.md).

Back to [Deployment Index](index.md).