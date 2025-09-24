# Community MCPs

Community MCPs are third-party servers contributed by the open-source community, providing additional capabilities like E2E testing and database management. The Vibe Coding Tool integrates these via the registry, allowing users to deploy and use them alongside built-in and custom MCPs. From the clone report, examples include Playwright for testing and mcp-database-server for DB operations.

These MCPs are cloned from public repos and deployed to HF Spaces. They expand the ecosystem for testing and data management.

## Playwright MCP

**Description**: Community MCP for end-to-end testing automation using Playwright. Enables browser testing, screenshot capture, and UI validation from the orchestrator.

**Capabilities**:
- "e2e_test": Run Playwright tests on URLs or components.
- "screenshot": Capture page screenshots.
- "browser_automation": Scripted browser interactions.

**Deployment**:
1. Clone: `git clone https://github.com/microsoft/playwright-mcp testing-mcps/playwright-mcp`.
2. Setup: Install Playwright browsers: `playwright install`.
3. Edit main.py or equivalent to expose tools (use mcp-python-sdk if Python wrapper).
4. Requirements: playwright, mcp-sdk.
5. Docker: Build with browser deps (see repo Dockerfile).
6. Deploy to HF Space as in [HF Spaces](../deployment/hf-spaces.md).
7. Registry: "id": "playwright-mcp", "capabilities": ["e2e_test", "screenshot"].

**Usage**:
- Task: "Run E2E tests on my app" – input URL, test script; returns pass/fail, screenshots.
- Integration: In workflows, route to this MCP for "test project" tasks.
- Results: JSON with test results, base64 screenshots or pointers to HF storage.

**Health**: /health returns Playwright version and browser status.

## Database MCPs

**Description**: Community MCP for database operations, such as schema management and queries. Based on mcp-database-server, supports multiple DBs (PostgreSQL, MySQL).

**Capabilities**:
- "db_query": Execute SQL queries.
- "schema_manage": Run migrations, seed data.
- "db_health": Check connection/status.

**Deployment**:
1. Clone: `git clone https://github.com/executeautomation/mcp-database-server database-mcps/mcp-database-server`.
2. Config: Edit config for DB credentials (use env for security).
3. Implement tools: Extend for Prisma/Django if needed (see seeding-orchestrator-mcp for multi-backend).
4. Requirements: sqlalchemy, psycopg2 (PostgreSQL), mysql-connector.
5. Docker: Build with DB drivers.
6. Deploy to HF or oracle.
7. Registry: "id": "database-mcp", "capabilities": ["db_query", "schema_manage"].

**Usage**:
- Task: "Query DB for users" – input SQL, connection details; returns results.
- Integration: For seeding (use seeding-orchestrator-mcp), migrations.
- Results: JSON rows; pointers for large dumps.

**Health**: /health returns DB connection status.

These community MCPs add testing and DB support. For more, search MCP community registry. Development: [MCP Development](../developer/mcp-development.md).

Back to [MCP Servers](index.md).