# FastAPI Backend Architecture

The backend orchestrator is a FastAPI-based service that serves as the central hub for task orchestration, MCP management, and API exposure. It implements the split-processing model, routing lightweight tasks to oracle-hosted wrappers and heavy tasks to user HF Spaces. Built with Python 3.11+, it uses async patterns for high performance.

## Project Structure

The backend follows a modular structure for maintainability:

```
orchestrator/
├── api/                 # FastAPI routes and endpoints
│   ├── __init__.py
│   ├── agents.py        # Agent operations
│   ├── auth.py          # Authentication endpoints
│   ├── health.py        # Health checks
│   ├── kg.py            # Knowledge Graph queries
│   ├── mcps.py          # MCP management
│   ├── projects.py      # Project CRUD
│   ├── response.py      # Response models
│   └── tasks.py         # Task creation/execution
├── config/              # Configuration
│   ├── __init__.py
│   └── settings.py      # Pydantic settings from env
├── core/                # Business logic
│   ├── __init__.py
│   ├── auth_service.py  # JWT/OAuth handling
│   ├── job_manager.py   # Job lifecycle
│   ├── registry.py      # MCP registry
│   ├── result_manager.py # Result storage/retrieval
│   └── task_router.py   # Task routing
├── middleware/          # Middleware
│   ├── __init__.py
│   └── error_handler.py # Global error handling
├── models/              # Pydantic/SQLAlchemy models
│   ├── __init__.py
│   ├── agent.py
│   ├── job.py
│   ├── mcp.py
│   ├── project.py
│   ├── response.py
│   ├── result.py
│   ├── sql_models.py    # DB schemas
│   └── task.py
├── services/            # External integrations
│   ├── github_service.py
│   └── hf_service.py
├── utils/               # Utilities
│   ├── __init__.py
│   ├── crypto.py        # Encryption
│   ├── metrics.py       # Prometheus
│   └── rate_limiter.py
├── main.py              # FastAPI app entrypoint
├── alembic.ini          # DB migrations
├── requirements.txt     # Dependencies: fastapi, sqlalchemy, redis, rq, pyjwt, etc.
└── docker-compose.yml  # Services: app, postgres, redis
```

This structure separates concerns: API for exposure, core for logic, models for data, services for externals.

## Task Routing

The `TaskRouter` in `core/task_router.py` determines MCP targets based on task type, capabilities, and registry flags.

Key Features:
- **Capability Matching**: Queries registry for MCPs supporting required tools (e.g., "file_operations" → GitHub MCP).
- **Split-Processing**: Checks `can_run_on_user_space` flag; routes heavy tasks (e.g., Semgrep analysis) to HF Spaces.
- **Fallback Logic**: If user Space unavailable, falls back to oracle if `fallback_to_oracle: true` and consent given.
- **Health Monitoring**: Probes MCPs via `/health` before routing.

Example from plan:
```python
class TaskRouter:
    def route_task(self, task: Task) -> MCPTarget:
        """Determine where to execute task based on registry"""
        capabilities = self.get_mcp_capabilities(task.required_capabilities)
        best_mcp = self.select_best_mcp(task.type, capabilities)
        if best_mcp.can_run_on_user_space and not task.is_heavy:
            return MCPTarget(url=best_mcp.user_space_url, type="user")
        elif task.is_heavy:
            return MCPTarget(url=best_mcp.space_url, type="hf_space")
        else:
            return MCPTarget(url=self.oracle_worker, type="oracle", consent_required=True)
    
    def select_best_mcp(self, task_type: str, mcps: List[MCPInfo]) -> MCPInfo:
        """Rank MCPs by suitability"""
        # Logic: priority by load, location, cost
        return max(mcps, key=lambda m: m.score_for(task_type))
```

Routing uses Redis for low-latency registry caching.

## Job Management

The `JobManager` in `core/job_manager.py` handles the full lifecycle using RQ for queuing.

Key Features:
- **Enqueue/Execute**: Creates jobs, queues via Redis, workers process asynchronously.
- **Status Tracking**: Polls status (pending, running, completed, failed).
- **Retry/Failure Handling**: Up to 3 retries; fallbacks on failure.
- **Concurrency**: Limits via `MAX_CONCURRENT_JOBS`.

Example:
```python
class JobManager:
    async def create_job(self, task: Task) -> Job:
        """Create and queue a new job"""
        job = Job(id=uuid(), task=task, status="pending")
        self.queue.enqueue(self.execute_job, job.id)
        return job
    
    async def execute_job(self, job: Job) -> Result:
        """Execute on target MCP"""
        target = self.router.route_task(job.task)
        if target.type == "hf_space":
            result = await self.dispatch_to_space(job, target.url)
        else:
            result = await self.oracle_execute(job, target)
        await self.result_manager.store_result(result)
        return result
    
    async def handle_failure(self, job: Job, error: Exception) -> None:
        """Retry or fallback"""
        if job.retries < 3:
            job.retries += 1
            self.queue.enqueue(self.execute_job, job.id)
        else:
            # Fallback or notify user
            await self.notify_failure(job, str(error))
```

Integrates with external services (e.g., GitHub API via `services/github_service.py`).

## Result Handling

The `ResultManager` in `core/result_manager.py` manages outputs, supporting direct results and pointers for large data.

Key Features:
- **Storage**: Small results in Redis/PostgreSQL; large in HF Datasets with pointers.
- **Retrieval**: Fetches pointers asynchronously.
- **Pointer Support**: For heavy MCPs, returns `{"type": "pointer", "location": "hf://dataset/path"}`.

Example:
```python
class ResultManager:
    async def store_result(self, result: Result) -> str:
        """Store in cache or persistent storage"""
        if len(result.data) < 1MB:
            return self.redis.set(f"result:{result.id}", result.data)
        else:
            pointer = await self.hf_service.upload_to_dataset(result.data)
            return self.store_pointer(result.id, pointer)
    
    async def get_result(self, result_id: str) -> Result:
        """Retrieve by ID"""
        cached = self.redis.get(f"result:{result_id}")
        if cached:
            return Result(id=result_id, data=cached)
        pointer = self.get_pointer(result_id)
        if pointer:
            return await self.resolve_pointer(pointer)
        raise ValueError("Result not found")
```

Results are streamed to frontend via Server-Sent Events.

## Tech Stack and Best Practices

- **Framework**: FastAPI for async API, auto-docs (Swagger).
- **Database**: SQLAlchemy + Alembic for ORM/migrations; PostgreSQL for users/projects/tasks.
- **Queue**: RQ + Redis for background jobs.
- **Auth**: PyJWT for tokens, OAuthlib for GitHub/HF.
- **Monitoring**: Prometheus metrics, structlog JSON logging.
- **Testing**: Pytest for unit/integration; coverage >85%.
- **Security**: Rate limiting, input validation (Pydantic), HTTPS enforced.

For development: See [Developer Docs](../developer/backend-development.md). Cross-ref: [MCP Registry](mcp-registry.md).

Back to [Overview](overview.md).