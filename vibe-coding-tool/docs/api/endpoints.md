# All API Endpoints

This section lists all API endpoints, grouped by category. Each includes method, path, description, parameters, and response. Auth required for most (see [Authentication](authentication.md)). Base URL: `/api`.

Use Swagger at `/docs` for interactive testing. From technical specifications and backend plan.

## Auth Endpoints

- **POST /api/auth/login**
  - Description: Authenticate user and return JWT.
  - Parameters: JSON body {email: str, password: str}.
  - Response: 200 {access_token: str, refresh_token: str, user: User}.
  - Errors: 401 Invalid credentials.

- **POST /api/auth/github**
  - Description: GitHub OAuth callback.
  - Parameters: Query code (from redirect).
  - Response: 200 Redirect to frontend with token.
  - Errors: 400 Invalid code.

- **POST /api/auth/huggingface**
  - Description: HF OAuth callback.
  - Parameters: Query code.
  - Response: 200 Redirect.
  - Errors: 400 Invalid code.

- **POST /api/auth/refresh**
  - Description: Refresh JWT.
  - Parameters: Header Authorization: Bearer refresh_token.
  - Response: 200 {access_token: str}.
  - Errors: 401 Invalid refresh.

## Task Endpoints

- **POST /api/tasks**
  - Description: Create new task.
  - Parameters: JSON {type: str, input: dict, priority: str, required_capabilities: list}.
  - Response: 201 {task_id: str, status: "pending"}.
  - Errors: 400 Invalid task, 429 Rate limit.

- **GET /api/tasks/{task_id}**
  - Description: Get task status and result.
  - Parameters: Path task_id.
  - Response: 200 {id: str, status: str, result: dict or pointer}.
  - Errors: 404 Not found.

- **POST /api/tasks/{task_id}/cancel**
  - Description: Cancel running task.
  - Parameters: Path task_id.
  - Response: 200 {status: "cancelled"}.
  - Errors: 400 Not cancellable.

- **GET /api/tasks/history**
  - Description: List user's tasks.
  - Parameters: Query limit (int=50), offset (int=0).
  - Response: 200 {tasks: list[Task], total: int}.
  - Errors: None.

## Project Endpoints

- **POST /api/projects**
  - Description: Create project.
  - Parameters: JSON {name: str, description: str, repository_url: str, template: str}.
  - Response: 201 {id: str, name: str}.
  - Errors: 400 Invalid spec, 401 Unauthorized.

- **GET /api/projects/{id}**
  - Description: Get project details.
  - Parameters: Path id.
  - Response: 200 {id: str, name: str, repo: str, kg_url: str}.
  - Errors: 404 Not found.

- **PUT /api/projects/{id}**
  - Description: Update project.
  - Parameters: Path id, JSON {name, description}.
  - Response: 200 Updated project.
  - Errors: 400 Invalid data.

- **DELETE /api/projects/{id}**
  - Description: Delete project.
  - Parameters: Path id.
  - Response: 204 No content.
  - Errors: 404 Not found.

- **GET /api/projects/list**
  - Description: List user's projects.
  - Parameters: Query limit (int), offset (int).
  - Response: 200 {projects: list, total: int}.
  - Errors: None.

## MCP Endpoints

- **GET /api/mcps/list**
  - Description: List available MCPs.
  - Parameters: Query user_id (optional).
  - Response: 200 {mcps: list[MCPInfo]}.
  - Errors: None.

- **GET /api/mcps/{id}/capabilities**
  - Description: Get MCP capabilities.
  - Parameters: Path id.
  - Response: 200 {capabilities: list[str], tools: dict}.
  - Errors: 404 MCP not found.

- **POST /api/mcps/{id}/execute**
  - Description: Execute MCP tool.
  - Parameters: Path id, JSON {tool: str, arguments: dict}.
  - Response: 200 {result: dict}.
  - Errors: 400 Invalid tool, 503 MCP unavailable.

- **GET /api/mcps/health**
  - Description: Check all MCP health.
  - Parameters: None.
  - Response: 200 {mcps: list[HealthStatus]}.
  - Errors: None.

## KG Endpoints

- **POST /api/kg/generate**
  - Description: Generate KG for project.
  - Parameters: JSON {project_id: str, source_data: dict (files)}.
  - Response: 201 {kg_id: str, status: "generating"}.
  - Errors: 400 Invalid data.

- **GET /api/kg/{kg_id}**
  - Description: Get KG data.
  - Parameters: Path kg_id.
  - Response: 200 {nodes: list, edges: list}.
  - Errors: 404 Not found.

- **POST /api/kg/query**
  - Description: Query KG (SPARQL).
  - Parameters: JSON {kg_id: str, query: str}.
  - Response: 200 {results: list}.
  - Errors: 400 Invalid query.

- **PUT /api/kg/update**
  - Description: Update KG.
  - Parameters: JSON {kg_id: str, updates: dict}.
  - Response: 200 {kg_id: str}.
  - Errors: 400 Invalid update.

## Agent Endpoints

- **GET /api/agents/list**
  - Description: List available agents.
  - Parameters: None.
  - Response: 200 {agents: list[Agent]}.
  - Errors: None.

- **POST /api/agents/execute**
  - Description: Execute agent task.
  - Parameters: JSON {agent_id: str, input: dict}.
  - Response: 200 {result: dict}.
  - Errors: 400 Invalid input.

- **GET /api/agents/templates**
  - Description: Get agent templates.
  - Parameters: None.
  - Response: 200 {templates: list}.
  - Errors: None.

- **POST /api/agents/custom**
  - Description: Create custom agent.
  - Parameters: JSON {name: str, template: dict}.
  - Response: 201 {agent_id: str}.
  - Errors: 400 Invalid template.

For models: [Models](models.md). Errors: [Error Codes](error-codes.md).

Back to [API Index](index.md).