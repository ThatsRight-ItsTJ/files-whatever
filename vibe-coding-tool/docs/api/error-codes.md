# Error Responses and Codes

The API uses standard HTTP status codes for responses. Errors return a JSON body with `ErrorResponse` model for details. Custom error codes are prefixed with "VCT_" for Vibe Coding Tool-specific issues. From backend error_handler.py and plans.

## Standard HTTP Codes

- **200 OK**: Success.
- **201 Created**: Resource created (e.g., task/project).
- **204 No Content**: Success, no body (e.g., delete).
- **400 Bad Request**: Invalid input (validation error).
- **401 Unauthorized**: Auth failed (invalid/missing token).
- **403 Forbidden**: Insufficient permissions.
- **404 Not Found**: Resource not found (task/project/MCP).
- **429 Too Many Requests**: Rate limit exceeded.
- **500 Internal Server Error**: Server error.
- **502 Bad Gateway**: MCP unavailable.
- **503 Service Unavailable**: System overload or maintenance.

## ErrorResponse Model

All error responses use this Pydantic model:
```python
from pydantic import BaseModel
from typing import Optional, List

class ErrorResponse(BaseModel):
    code: str  # HTTP or custom (e.g., "VCT_TASK_INVALID")
    message: str
    details: Optional[str] = None
    field_errors: Optional[List[str]] = None  # For validation
```

JSON Example:
```json
{
  "code": "VCT_TASK_INVALID",
  "message": "Task type must be one of: code_gen, file_search",
  "details": "Invalid 'type' field",
  "field_errors": ["type"]
}
```

## Custom Error Codes

- **VCT_AUTH_INVALID** (401): Invalid JWT or OAuth code.
  - Message: "Invalid authentication token".
  - Details: "Token expired" or "OAuth code invalid".

- **VCT_TASK_INVALID** (400): Invalid task spec.
  - Message: "Task creation failed".
  - Details: "Missing required capabilities".

- **VCT_MCP_NOT_FOUND** (404): MCP id unknown.
  - Message: "MCP not found".
  - Details: "Check registry".

- **VCT_MCP_UNAVAILABLE** (503): MCP unhealthy.
  - Message: "MCP unavailable".
  - Details: "Health check failed; try fallback".

- **VCT_RATE_LIMIT** (429): Exceeded limit.
  - Message: "Rate limit exceeded".
  - Details: "Try again in {window} seconds".

- **VCT_KG_QUERY_ERROR** (400): Invalid SPARQL.
  - Message: "KG query failed".
  - Details: "Syntax error in query".

- **VCT_JOB_FAILED** (500): Task execution error.
  - Message: "Job failed".
  - Details: MCP error or timeout.

- **VCT_FALLBACK_REQUIRED** (403): Consent needed for fallback.
  - Message: "Fallback to oracle requires consent".
  - Details: "Approve in UI".

Validation errors (Pydantic): 422 with field_errors list.

## Handling Errors

- **Client-Side**: Check status, parse ErrorResponse for user messages.
- **Logging**: Backend logs full stack traces (structlog).
- **Retry**: For 429/503, exponential backoff.
- **Monitoring**: Errors emit Prometheus metrics (error_total by code).

For auth errors: See [Authentication](authentication.md). Full list in OpenAPI spec.

Back to [API Index](index.md).