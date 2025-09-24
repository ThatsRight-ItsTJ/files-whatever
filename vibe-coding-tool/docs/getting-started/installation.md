# Installation Guide

This guide provides detailed instructions for installing the Vibe Coding Tool in various environments: local development, Docker-based setup, and production deployment. Follow the steps appropriate for your use case.

## Local Development Setup

For development, you'll set up the backend orchestrator and frontend separately.

### Backend (Orchestrator)

1. **Prerequisites**:
   - Python 3.11+
   - PostgreSQL 15+ (local or Docker)
   - Redis 7+ (local or Docker)
   - Install: `pip install -r orchestrator/requirements.txt`

2. **Database Setup**:
   - Create database:
     ```
     createdb vibe_coding_tool  # Or use psql: CREATE DATABASE vibe_coding_tool;
     ```
   - Run migrations:
     ```
     cd orchestrator
     alembic upgrade head
     ```

3. **Environment Variables**:
   - Copy and edit `.env`:
     ```
     cp orchestrator/.env.example .env
     ```
   - Key variables (from orchestrator/README.md):
     ```
     DATABASE_URL=postgresql://postgres:password@localhost:5432/vibe_coding_tool
     REDIS_URL=redis://localhost:6379/0
     JWT_SECRET=your-super-secret-jwt-key-here  # Use a secure random string
     GITHUB_CLIENT_ID=your-github-oauth-client-id
     GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
     GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
     HF_CLIENT_ID=your-hf-client-id
     HF_CLIENT_SECRET=your-hf-client-secret
     HF_REDIRECT_URI=http://localhost:3000/auth/huggingface/callback
     SECRET_KEY=your-fastapi-secret-key
     ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
     RATE_LIMIT_REQUESTS=100
     RATE_LIMIT_WINDOW=60
     MAX_CONCURRENT_JOBS=10
     DEFAULT_TASK_TIMEOUT=300
     ENABLE_METRICS=true
     METRICS_PORT=8090
     ```
   - For OAuth: Register apps at GitHub Developers and Hugging Face Settings > Tokens. Set redirect URIs as above.

4. **Run the Server**:
   ```
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Verify: http://localhost:8000/docs (Swagger UI).

### Frontend

1. **Prerequisites**:
   - Node.js 18+ and npm 8+

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Environment Variables**:
   - Create `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your-nextauth-secret
     GITHUB_ID=your-github-client-id
     GITHUB_SECRET=your-github-client-secret
     HUGGINGFACE_ID=your-hf-client-id
     HUGGINGFACE_SECRET=your-hf-client-secret
     ```

4. **Run the App**:
   ```
   npm run dev
   ```
   - Access: http://localhost:3000

## Docker Setup

Docker simplifies setup with all services (orchestrator, DB, Redis).

1. **Prerequisites**:
   - Docker and Docker Compose installed.

2. **Environment**:
   - Edit `orchestrator/.env` as above.
   - Ensure ports 8000 (API), 5432 (DB), 6379 (Redis), 3000 (Frontend) are free.

3. **Start Services**:
   ```
   cd orchestrator
   docker compose up -d
   ```
   - Includes: orchestrator (FastAPI), postgres, redis.
   - Migrations auto-run on startup (or manual: `docker compose exec app alembic upgrade head`).

4. **Frontend in Docker** (Optional):
   - Use `docker-compose.simple.yml` or build separately:
     ```
     docker build -t vibe-frontend .
     docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8000 vibe-frontend
     ```

5. **Verify**:
   - Backend: `docker compose logs app`
   - Health: `curl http://localhost:8000/health`
   - Frontend: Run separately or integrate.

For minimal setup: `docker compose -f docker-compose.minimal.yml up -d`.

## Production Prerequisites

- **Infrastructure**: Oracle Cloud VPS (for orchestrator), Vercel (frontend), Hugging Face Spaces (MCPs).
- **Security**: SSL/TLS certificates, firewall (ports 80/443), secrets management (e.g., Vault).
- **Monitoring**: Prometheus/Grafana (included in docker-compose).
- **Scaling**: Kubernetes for orchestrator, auto-scaling for HF Spaces.
- **CI/CD**: GitHub Actions for builds/tests/deployments (see [Deployment](../deployment/ci-cd.md)).

### Production Environment Variables

Extend local `.env`:
```
# Production
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:pass@prod-db:5432/vibe_coding_tool
REDIS_URL=redis://prod-redis:6379/0
ALLOWED_ORIGINS=https://yourdomain.com
# Add SSL, monitoring endpoints
NGINX_CONF=/etc/nginx/nginx.conf
CERTS_PATH=/etc/nginx/certs
```

### Deploy Backend to Oracle Cloud

1. Build Docker image:
   ```
   cd orchestrator
   docker build -t vibe-orchestrator:latest .
   ```

2. Use docker-compose.prod.yml:
   ```
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```
   - Includes NGINX for SSL reverse proxy.

3. For Kubernetes/Terraform: See [Production Deployment](../deployment/production.md).

### Deploy Frontend to Vercel

1. Push to GitHub.
2. Connect Vercel to repo.
3. Set env vars in Vercel dashboard (NEXT_PUBLIC_API_URL=https://your-orchestrator.com).
4. Deploy: Automatic on push.

## MCP Installation

MCPs are deployed separately:

1. **Built-in MCPs** (e.g., Semgrep, Tree-sitter):
   - Use `hfspace-worker-template`:
     ```
     cd hfspace-worker-template/worker
     # Edit requirements.txt, main.py, mcp.json
     # Deploy via HF CLI: huggingface-cli repo create --duplicate hfspace-worker-template your-mcp-space
     ```

2. **Custom MCPs** (e.g., Libraries.io):
   - Clone from custom-mcps/, build Docker, deploy to HF Space.
   - Update registry: Add to `orchestrator/config/metamcp_registry.json` with URL, capabilities, flags (e.g., "can_run_on_user_space": true).

3. **Oracle-Hosted Wrappers** (e.g., GitHub File-Seek):
   - Run locally or on VPS: `docker run github-file-seek-mcp-wrapper`.

Verify MCP health: `GET /api/mcps/health`.

## Post-Installation

- **Testing**: Run `pytest` in orchestrator, `npm test` in frontend.
- **Monitoring**: Access Grafana at http://localhost:3000 (admin/admin).
- **Next**: [Quickstart](quickstart.md) for first run.

For troubleshooting: [Troubleshooting](troubleshooting.md). Advanced: [Deployment](../deployment/index.md).