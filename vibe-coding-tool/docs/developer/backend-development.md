# Backend Development Guide

This guide is for developers working on the FastAPI backend orchestrator. It covers setting up the dev environment, implementing API endpoints, working with models and services, and testing. Builds on [Architecture - Backend](../architecture/backend.md) and assumes Python 3.11+.

## Setting Up Dev Environment

1. **Prerequisites**:
   - Python 3.11+, pip, virtualenv.
   - PostgreSQL, Redis (use Docker for ease).
   - GitHub/HF tokens for integration testing.

2. **Clone and Install**:
   ```
   git clone https://github.com/ThatsRight-ItsTJ/vibe-coding-tool.git
   cd vibe-coding-tool/orchestrator
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For testing: pytest, black, etc.
   ```

3. **Database and Queue**:
   - Start services:
     ```
     docker compose up -d postgres redis
     ```
   - Migrations:
     ```
     alembic upgrade head
     ```
   - Test connection: `psql $DATABASE_URL` and `redis-cli ping`.

4. **Environment Variables**:
   - Copy `.env.example` to `.env` and edit (see [Installation](../getting-started/installation.md#environment-variables)).
   - For dev: Set `DEBUG=true`, `LOG_LEVEL=DEBUG`.

5. **Run Server**:
   ```
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Access: http://localhost:8000/docs (Swagger for testing endpoints).
   - Logs: Console output with structlog.

6. **Linting and Formatting**:
   ```
   black .
   isort .
   flake8 .
   mypy .  # Type checking
   pre-commit install  # If using hooks
   ```

## API Endpoints

API uses FastAPI routers in `api/`. Key endpoints from plans:

- **Auth** (`api/auth.py`):
  - POST /api/auth/login: {email, password} → JWT token.
  - POST /api/auth/github: OAuth callback.
  - GET /api/user/profile: User info.

- **Tasks** (`api/tasks.py`):
  - POST /api/tasks: Create task {type, input, capabilities} → task_id.
  - GET /api/tasks/{id}: Status and result.
  - GET /api/tasks/history: List user's tasks (limit, offset).

- **Projects** (`api/projects.py`):
  - POST /api/projects: {name, description, template} → project_id.
  - GET /api/projects/{id}: Details.
  - PUT /api/projects/{id}: Update.
  - GET /api/projects/list: User's projects.

- **MCPs** (`api/mcps.py`):
  - GET /api/mcps/list: Available MCPs.
  - GET /api/mcps/{id}/capabilities: Tools.
  - POST /api/mcps/{id}/execute: Run tool.
  - GET /api/mcps/health: All statuses.

- **KG** (`api/kg.py`):
  - POST /api/kg/generate: {project_id, files} → kg_id.
  - GET /api/kg/{id}: Graph data.
  - POST /api/kg/query: SPARQL query.

- **Agents** (`api/agents.py`):
  - GET /api/agents/list: Available agents.
  - POST /api/agents/execute: {agent_id, input} → result.

Implement new endpoints in respective files, add to main.py routers. Use Pydantic for request/response models. Auto-docs via FastAPI.

Example adding endpoint:
```python
from fastapi import APIRouter, Depends
from .models.task import TaskCreate, TaskResponse

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, current_user = Depends(get_current_user)):
    # Logic
    return await job_manager.create_job(task)
```

## Models and Services

### Models (`models/`)

- **Pydantic Models**: For API schemas (e.g., `TaskCreate`, `MCPInfo`).
  Example:
  ```python
  from pydantic import BaseModel
  from typing import List

  class TaskCreate(BaseModel):
      type: str
      input: dict
      required_capabilities: List[str] = []

  class MCPInfo(BaseModel):
      id: str
      capabilities: List[str]
      url: str
  ```

- **SQL Models** (`sql_models.py`): SQLAlchemy for DB (users, projects, tasks).
  Example:
  ```python
  from sqlalchemy import Column, String, ForeignKey
  from sqlalchemy.orm import relationship

  class User(Base):
      __tablename__ = "users"
      id = Column(String, primary_key=True)
      email = Column(String, unique=True)
      projects = relationship("Project", back_populates="user")
  ```

Use Alembic for migrations: `alembic revision --autogenerate -m "add field"`.

### Services (`services/`)

Encapsulate external logic.

- **GitHubService**: API calls for repos/files.
  Example:
  ```python
  class GitHubService:
      async def create_repo(self, spec: RepoSpec) -> Repository:
          resp = await self.client.post("/user/repos", json=spec.dict())
          return Repository.from_response(resp)
  ```

- **HFService**: Space deployment, dataset upload.
  - Use huggingface_hub library.

Services injected via Depends in endpoints; mock for testing.

## Testing Backend

From TESTING.md and plans: Comprehensive strategy with pytest.

1. **Unit Tests** (`tests/unit/`):
   - Test services, utils (e.g., routing logic).
   ```
   pytest tests/unit/test_task_router.py -v
   ```
   Example:
   ```python
   def test_route_task():
       router = TaskRouter(registry)
       target = router.route_task(Task(type="file_search"))
       assert target.type == "oracle"
   ```

2. **Integration Tests** (`tests/integration/`):
   - API endpoints with TestClient, mock externals.
   ```
   pytest tests/integration/test_api.py --cov
   ```
   Use pytest-asyncio for async; factories for DB fixtures.

3. **E2E Tests**:
   - Docker compose for full stack; Playwright for frontend, but backend-focused with requests.
   - Load tests: Locust for concurrency (100 users, <2s response).

4. **Coverage and CI**:
   - `pytest --cov=. --cov-report=html` (>85% target).
   - GitHub Actions: Run on push (from TESTING.md).

Mock MCPs with responses; test fallbacks, auth.

For frontend dev: [Frontend Development](frontend-development.md). MCPs: [MCP Development](mcp-development.md).

Back to [Developer Docs](index.md).