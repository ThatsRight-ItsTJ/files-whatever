# Troubleshooting Common Issues

Encountering problems during setup or usage? This guide covers frequent issues based on common user reports from the clone process, development plans, and runtime errors. If your issue isn't listed, check logs (e.g., `docker compose logs`) or search the [GitHub Issues](https://github.com/ThatsRight-ItsTJ/vibe-coding-tool/issues).

## Port Conflicts

**Issue**: Services fail to start with "address already in use" (e.g., port 8000 for backend, 3000 for frontend).

**Symptoms**:
- `uvicorn` or `npm run dev` errors: "Error: listen EADDRINUSE :::8000".
- Docker: "port is already allocated".

**Solutions**:
1. **Check Running Processes**:
   ```
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows
   ```
   Kill conflicting processes: `kill -9 <PID>`.

2. **Change Ports in Config**:
   - Backend: Edit `orchestrator/main.py` or use `--port 8001` in uvicorn.
   - Frontend: Set `PORT=3001` in `.env.local`.
   - Docker: Update `docker-compose.yml` ports (e.g., "8001:8000").

3. **Firewall/Proxy**: Ensure ports are open: `ufw allow 8000` (Ubuntu) or check corporate proxy.

**Prevention**: Use `docker compose down` to stop services cleanly.

## Dependency Errors

**Issue**: Installation fails due to missing packages or version conflicts.

**Symptoms**:
- `pip install -r requirements.txt`: "No matching distribution" or "Could not find a version".
- `npm install`: "ERR! code ERESOLVE" for peer dependencies.
- From clone log: Some MCP repos [NOT FOUND] (e.g., anthropic-mcp-servers, semgrep-mcp).

**Solutions**:
1. **Python Dependencies**:
   - Update pip: `pip install --upgrade pip`.
   - Use virtual env: `python -m venv venv && source venv/bin/activate`.
   - For conflicts: `pip install -r requirements.minimal.txt` (lighter deps).
   - Missing MCPs: Manually clone available ones (e.g., `git clone https://github.com/wrale/mcp-server-tree-sitter` for Tree-sitter). Ignore non-critical [NOT FOUND] repos; use built-ins.

2. **Node Dependencies**:
   - Clear cache: `npm cache clean --force && rm -rf node_modules package-lock.json`.
   - Use legacy peer deps: `npm install --legacy-peer-deps`.
   - Node version: Use nvm to switch to 18.x: `nvm use 18`.

3. **Docker Builds**:
   - Pull latest images: `docker compose pull`.
   - Build errors: Increase memory (Docker settings > Resources > 4GB+).

**Prevention**: Pin versions in requirements.txt/package.json. Run in clean env.

## MCP Connection Issues

**Issue**: Tasks fail with "MCP unavailable" or "Health check failed".

**Symptoms**:
- API: 502/503 on `/api/mcps/health` or task execution.
- HF Spaces: "Space not responding" after deployment.
- Registry errors: "Unknown MCP" for tools like Semgrep.

**Solutions**:
1. **Verify MCP Deployment**:
   - Check HF Space status: Visit https://huggingface.co/spaces/your-username/your-mcp.
   - Test endpoint: `curl https://your-mcp.hf.space/health`.
   - For local wrappers (e.g., GitHub File-Seek): `docker run -p 8080:8000 github-file-seek-mcp-wrapper && curl http://localhost:8080/health`.

2. **Update Registry**:
   - Edit `orchestrator/config/metamcp_registry.json`:
     ```
     {
       "mcp_id": "semgrep",
       "url": "https://your-semgrep-space.hf.space",
       "capabilities": ["code_analysis"],
       "can_run_on_user_space": true,
       "result_pointer_preferred": true,
       "fallback_to_oracle": false
     }
     ```
   - Restart orchestrator: `docker compose restart app`.

3. **Network/Auth**:
   - HF Token: Ensure `HF_TOKEN` in MCP .env; reprovision Space.
   - Proxy: Set `HTTP_PROXY` if behind corporate firewall.
   - From plans: Dynamic discovery fails? Manually add to registry.

**Prevention**: Use health monitoring in Grafana. Test MCPs individually before tasks.

## Database Setup Problems

**Issue**: Migrations fail or connection errors.

**Symptoms**:
- `alembic upgrade head`: "No such table" or "Connection refused".
- App logs: "OperationalError: could not connect to server".

**Solutions**:
1. **Start DB**:
   - Docker: Ensure `docker compose up postgres redis` first.
   - Local: `brew install postgresql redis` (macOS) or apt; `pg_ctl start`.

2. **Connection String**:
   - Verify `DATABASE_URL` in .env (user/pass/host/port/dbname).
   - Test: `psql $DATABASE_URL` should connect.

3. **Migrations**:
   - Init if needed: `alembic init alembic`.
   - Run: `docker compose exec app alembic upgrade head`.
   - Errors: Check alembic.ini for sqlalchemy.url matching DATABASE_URL.

4. **Redis**:
   - Similar: `redis-cli ping` should return "PONG".
   - Clear cache if stale: `redis-cli flushall`.

**Prevention**: Use Docker for consistent DB versions. Backup before migrations.

## Other Common Issues

- **OAuth Failures**: Invalid redirect URI? Double-check GitHub/HF app settings. Clear browser cache.
- **Rate Limiting**: Too many requests? Increase `RATE_LIMIT_REQUESTS` in .env; wait 60s.
- **Frontend-Backend Mismatch**: CORS error? Add origins to ALLOWED_ORIGINS.
- **Clone/Repo Errors**: From log, some MCPs missing – skip or find alternatives (e.g., use community playwright-mcp).
- **Performance**: Heavy tasks slow? Deploy MCPs to HF Spaces for user-side compute.
- **Logs**: Always check `docker compose logs -f` or app logs for details.

If unresolved, provide logs/error messages in a GitHub issue. See [Deployment](../deployment/troubleshooting.md) for production-specific fixes or [FAQ](../user-guides/faq.md) for usage questions.

Back to [Getting Started](../index.md).