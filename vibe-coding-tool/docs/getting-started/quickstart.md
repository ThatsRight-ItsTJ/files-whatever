# Quickstart Guide

This guide walks you through setting up and running the Vibe Coding Tool locally, creating your first project, and executing a basic task. It assumes basic familiarity with Git, Docker, and npm.

## System Requirements

- **Operating System**: Linux, macOS, or Windows (with WSL2 for Docker).
- **Hardware**: 4GB RAM minimum; 8GB+ recommended for MCP deployments.
- **Software**:
  - Git 2.30+
  - Docker 20.10+ and Docker Compose 2.0+
  - Node.js 18+ and npm 8+
  - Python 3.11+ (for manual backend setup)
- **Accounts**:
  - GitHub account with OAuth app configured (Client ID/Secret).
  - Hugging Face account for MCP Spaces.

Verify Docker: `docker --version` and `docker compose version`.

## Clone and Setup

1. **Clone the Repository**:
   ```
   git clone https://github.com/ThatsRight-ItsTJ/vibe-coding-tool.git
   cd vibe-coding-tool
   ```

   This clones the core project, including the orchestrator, frontend, and MCP templates. The clone log shows successful cloning of dependencies like libraries-io-mcp-server, Your-PaL-MoE, and official MCPs (e.g., semgrep, tree-sitter).

2. **Environment Configuration**:
   - Navigate to `orchestrator/`:
     ```
     cd orchestrator
     cp .env.example .env
     ```
   - Edit `.env` with your secrets:
     ```
     JWT_SECRET=your-super-secret-jwt-key-here  # Generate a strong key
     GITHUB_CLIENT_ID=your-github-client-id
     GITHUB_CLIENT_SECRET=your-github-client-secret
     HF_CLIENT_ID=your-hf-client-id
     HF_CLIENT_SECRET=your-hf-client-secret
     DATABASE_URL=postgresql://postgres:password@localhost:5432/vibe_coding_tool
     REDIS_URL=redis://localhost:6379/0
     ```
     - For OAuth, create apps at [GitHub](https://github.com/settings/developers) and [Hugging Face](https://huggingface.co/settings/tokens).
     - Redirect URIs: `http://localhost:3000/auth/github/callback` and similar for HF.

   - Return to root: `cd ..`

3. **Install Dependencies**:
   - Frontend: `npm install`
   - Backend (if not using Docker): `cd orchestrator && pip install -r requirements.txt`

## Run Locally

1. **Start Backend Services** (Orchestrator + DB/Queue):
   ```
   cd orchestrator
   docker compose up -d
   ```
   - This starts PostgreSQL, Redis, and the FastAPI server on port 8000.
   - Run migrations: `alembic upgrade head` (inside the container if needed: `docker compose exec app alembic upgrade head`).
   - Verify: `curl http://localhost:8000/health` should return `{"status": "healthy"}`.
   - API Docs: http://localhost:8000/docs

2. **Start Frontend**:
   ```
   cd ..  # Back to root
   npm run dev
   ```
   - Access at http://localhost:3000.
   - The frontend connects to the backend via `NEXT_PUBLIC_API_URL=http://localhost:8000` (set in `.env.local` if needed).

3. **Deploy a Sample MCP** (Optional but Recommended):
   - Use the HF Space Worker Template for a built-in MCP like Tree-sitter:
     ```
     cd hfspace-worker-template/worker
     # Edit mcp.json with your HF token
     # Deploy via HF UI or CLI: huggingface-cli spaces create --from-template
     ```
   - Update `metamcp_registry.json` (in orchestrator/config) with the Space URL and flags like `"can_run_on_user_space": true`.

   Services are now running! Logs: `docker compose logs -f`.

## Create First Project

1. **Authenticate**:
   - Open http://localhost:3000 in your browser.
   - Sign in via GitHub or Hugging Face OAuth.
   - Grant permissions for repo access and HF Spaces.

2. **New Project Wizard**:
   - Click "Create Project" in the dashboard.
   - Enter name (e.g., "My First App"), description, and select template (e.g., "React App").
   - Choose language/framework (e.g., TypeScript, Next.js).
   - The orchestrator calls GitHub MCP to create a repo and AutoBot MCP (if available) for initial scaffolding.
   - KG generation runs automatically via kglab GKG Ingest Adapter.

3. **Project Loaded**:
   - Files appear in the Monaco Editor.
   - Knowledge Graph visualizes structure (entities, relationships).
   - Status: Check task history for completion.

## Basic Task Execution

1. **AI-Assisted Code Generation**:
   - Open a file (e.g., `app/page.tsx`).
   - In the AI Panel, select an agent (e.g., "Code Generator").
   - Prompt: "Add a todo list component with Zustand state."
   - Submit: Task routes to appropriate MCP (e.g., code analysis via Tree-sitter).
   - Review diff, accept changes – auto-commits to GitHub.

2. **Run a MCP Task**:
   - Via UI: Select "Execute Task" > "File Search" > Query: "Find all utils files".
   - Or API: 
     ```
     curl -X POST "http://localhost:8000/api/tasks" \
       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{
         "type": "file_search",
         "input": {"query": "utils"},
         "required_capabilities": ["file_operations"]
       }'
     ```
   - Monitor status: `GET /api/tasks/{task_id}`.
   - Results: Streamed to UI or returned as JSON with pointers to HF Datasets if heavy.

3. **View Results**:
   - Tasks appear in history.
   - KG updates with new entities.
   - Errors? Check troubleshooting.

Congratulations! You've set up Vibe Coding Tool and executed your first AI task. Explore [User Guides](../user-guides/workflows.md) for advanced workflows.

For issues: [Troubleshooting](troubleshooting.md). Full installation: [Installation](installation.md).