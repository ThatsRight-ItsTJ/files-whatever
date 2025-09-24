# Dev Setup for Contributors

To contribute, set up the full development environment for backend, frontend, and MCPs. This ensures you can test changes end-to-end.

## Prerequisites

- **System**: Linux/macOS (WSL2 for Windows).
- **Tools**: Git, Docker/Docker Compose, Python 3.11+, Node 18+.
- **Accounts**: GitHub (OAuth), Hugging Face (tokens), Docker Hub (optional).

## Clone Repository

```
git clone https://github.com/ThatsRight-ItsTJ/vibe-coding-tool.git
cd vibe-coding-tool
```

## Backend Setup

1. **Install Dependencies**:
   ```
   cd orchestrator
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements-dev.txt
   ```

2. **Database and Queue**:
   ```
   docker compose up -d postgres redis
   alembic upgrade head
   ```

3. **Environment**:
   - Copy `.env.example` to `.env` and edit with tokens (see [Installation](../getting-started/installation.md#environment-variables)).
   - For testing: Use test GitHub/HF apps.

4. **Run**:
   ```
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Setup

1. **Install Dependencies**:
   ```
   cd ..  # Root
   npm install
   ```

2. **Environment**:
   - `.env.local` with API_URL=http://localhost:8000, OAuth secrets.

3. **Run**:
   ```
   npm run dev
   ```

## MCP Setup

1. **Template**:
   ```
   cd hfspace-worker-template/worker
   pip install -r requirements.txt
   ```

2. **Test Local**:
   ```
   uvicorn main:app --reload --port 7860
   ```

3. **Deploy Test MCP**:
   - Follow [MCP Development](../developer/mcp-development.md).
   - Add to registry.

## Full Stack Testing

- Run backend and frontend.
- Test auth, create project, run task.
- E2E: `npm run e2e` (Playwright).

## Tools and Linting

- Backend: `black .`, `pytest`.
- Frontend: `npm run lint`, `npm test`.
- Pre-commit: `pre-commit install`.

For issues: [Troubleshooting](../getting-started/troubleshooting.md).

Back to [Contributing](index.md).