# Pydantic Models Reference

This section details the Pydantic models used in the API for request/response validation. Models are defined in `orchestrator/models/` and ensure type safety and serialization. Schemas follow OpenAPI standards; see [Endpoints](endpoints.md) for usage.

All models inherit from `BaseModel` for JSON serialization. Examples include JSON representations.

## Core Models

### Task Models

**TaskCreate** (Request for POST /api/tasks)
- Used to create a new task.
```python
from pydantic import BaseModel
from typing import List, Dict, Any

class TaskCreate(BaseModel):
    type: str  # e.g., "code_gen", "file_search"
    input: Dict[str, Any]  # Task-specific input
    priority: str = "normal"  # "low", "normal", "high"
    required_capabilities: List[str] = []  # e.g., ["code_analysis"]
```

JSON Example:
```json
{
  "type": "code_gen",
  "input": {"prompt": "Add todo list"},
  "priority": "high",
  "required_capabilities": ["ai_assist"]
}
```

**TaskResponse** (Response for GET /api/tasks/{id})
- Task status and result.
```python
class TaskResponse(BaseModel):
    id: str
    type: str
    status: str  # "pending", "running", "completed", "failed"
    input: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None  # Or pointer
    created_at: datetime
    completed_at: Optional[datetime] = None
```

JSON Example:
```json
{
  "id": "task_123",
  "type": "code_gen",
  "status": "completed",
  "input": {"prompt": "Add todo list"},
  "result": {"code": "const Todo = () => ..."},
  "created_at": "2025-09-24T07:00:00Z",
  "completed_at": "2025-09-24T07:00:05Z"
}
```

### User Models

**User** (Response for GET /api/user/profile)
- User profile.
```python
class User(BaseModel):
    id: str
    email: str
    created_at: datetime
    hf_spaces: List[str] = []  # User's deployed MCP Spaces
```

JSON Example:
```json
{
  "id": "user_456",
  "email": "user@example.com",
  "created_at": "2025-09-24T07:00:00Z",
  "hf_spaces": ["https://hf.co/spaces/user/semgrep"]
}
```

### MCP Models

**MCPInfo** (Response for GET /api/mcps/list)
- MCP details.
```python
class MCPInfo(BaseModel):
    id: str
    name: str
    url: str
    capabilities: List[str]
    status: str  # "available", "unhealthy"
    can_run_on_user_space: bool = False
```

JSON Example:
```json
{
  "id": "semgrep-mcp",
  "name": "Semgrep Code Analysis",
  "url": "https://hf.co/spaces/user/semgrep",
  "capabilities": ["code_analysis", "security_scan"],
  "status": "available",
  "can_run_on_user_space": true
}
```

**MCPExecuteRequest** (Request for POST /api/mcps/{id}/execute)
```python
class MCPExecuteRequest(BaseModel):
    tool: str
    arguments: Dict[str, Any]
```

JSON Example:
```json
{
  "tool": "analyze_code",
  "arguments": {"files": ["main.py"], "rules": "security"}
}
```

## Project Models

**ProjectCreate** (Request for POST /api/projects)
```python
class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    repository_url: Optional[str] = None
    template: str = "basic"  # e.g., "nextjs", "flask"
```

**Project** (Response)
```python
class Project(BaseModel):
    id: str
    name: str
    description: str
    repository_url: str
    kg_url: Optional[str] = None  # HF Dataset for KG
    created_at: datetime
```

## KG Models

**KGGenerateRequest** (Request for POST /api/kg/generate)
```python
class KGGenerateRequest(BaseModel):
    project_id: str
    source_data: Dict[str, Any]  # e.g., {"files": list}
```

**KGResponse** (Response for GET /api/kg/{id})
```python
class KGResponse(BaseModel):
    id: str
    nodes: List[Dict[str, Any]]  # Entities
    edges: List[Dict[str, Any]]  # Relationships
```

## Agent Models

**AgentExecuteRequest** (Request for POST /api/agents/execute)
```python
class AgentExecuteRequest(BaseModel):
    agent_id: str
    input: Dict[str, Any]
```

**Agent** (Response for GET /api/agents/list)
```python
class Agent(BaseModel):
    id: str
    name: str
    description: str
    template_id: Optional[str] = None
```

## Error Models

See [Error Codes](error-codes.md) for ErrorResponse.

These models ensure consistent data shapes. For full schemas, generate from OpenAPI spec. Extend in `models/` with validators.

Back to [API Index](index.md).