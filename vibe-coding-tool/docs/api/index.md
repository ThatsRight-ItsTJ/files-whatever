# API Reference

The Vibe Coding Tool provides a RESTful API via FastAPI, accessible at `/docs` for interactive Swagger UI (OpenAPI spec). This reference details all endpoints, models, error codes, and authentication. Base URL: `http://localhost:8000` (dev) or your production URL.

The API supports JSON payloads, JWT auth, and async operations. Rate limited to 100 req/min.

## Sections

- **[Endpoints](endpoints.md)**: Full list of routes (auth, tasks, projects, MCPs, KG, agents).
- **[Models](models.md)**: Pydantic schemas for requests/responses (Task, User, MCPInfo).
- **[Error Codes](error-codes.md)**: HTTP status and custom errors.
- **[Authentication](authentication.md)**: JWT and OAuth details.

## OpenAPI Spec

- Interactive docs: `{base_url}/docs` (Swagger).
- ReDoc: `{base_url}/redoc`.
- Download spec: `{base_url}/openapi.json`.

Example curl (with auth):
```
curl -H "Authorization: Bearer {jwt_token}" -H "Content-Type: application/json" {base_url}/api/tasks
```

For implementation: See [Backend Development](../developer/backend-development.md). Test with Postman or Swagger.

Back to main docs.