# Developer Documentation

This section is for developers building, extending, or maintaining the Vibe Coding Tool. It covers setting up the development environment, implementing backend/frontend features, creating MCPs, and extending the system. Assumes familiarity with [Architecture](../architecture/overview.md) and basic setup from [Getting Started](../getting-started/index.md).

For API details: [API Reference](../api/index.md). Contribution: [Contributing](../contributing/index.md).

## Table of Contents

- **[Backend Development](backend-development.md)**: FastAPI setup, API endpoints, models, testing.
- **[Frontend Development](frontend-development.md)**: Next.js components, state management, editor integration.
- **[MCP Development](mcp-development.md)**: Creating custom MCPs, HF Space deployment, integration.
- **[Extending the System](extending.md)**: Adding MCPs, custom integrations, plugin architecture.

## Development Setup

1. **Prerequisites**:
   - Python 3.11+, Node 18+, Docker.
   - GitHub/HF accounts for testing integrations.

2. **Clone and Install**:
   - Follow [Installation](../getting-started/installation.md#local-development-setup).
   - Backend: `cd orchestrator && pip install -r requirements-dev.txt` (includes pytest, black).
   - Frontend: `npm install`.

3. **Run in Dev Mode**:
   - Backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.
   - Frontend: `npm run dev`.
   - MCP Template: `cd hfspace-worker-template && docker build -t mcp-template .`.

4. **Testing**:
   - Backend: `pytest` (unit/integration, coverage >85%).
   - Frontend: `npm test` (Vitest) + `npm run e2e` (Playwright).
   - Full: Use docker-compose for end-to-end.

5. **Tools**:
   - Linting: Black, isort, flake8 for Python; ESLint/Prettier for TS.
   - Monitoring: Grafana at localhost:3000.
   - Debug: API docs at /docs; logs in console.

## Best Practices

- **Code Style**: Follow plans – PEP8 for Python, Airbnb for JS/TS.
- **Testing**: 80% coverage; mock externals (HF/GitHub).
- **Security**: Validate inputs (Pydantic), sign jobs (RS256 samples).
- **Performance**: Async for I/O, cache registry in Redis.

Start with [Backend Development](backend-development.md) for core logic or [MCP Development](mcp-development.md) for extensions.

Back to main docs.