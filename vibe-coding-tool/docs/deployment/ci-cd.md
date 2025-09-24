# CI/CD Pipelines

The Vibe Coding Tool uses GitHub Actions for CI/CD, automating builds, tests, and deployments. This guide covers setting up pipelines for the backend, frontend, and MCPs. Pipelines ensure code quality, run tests, and deploy to production (Vercel for frontend, Oracle for backend, HF for MCPs). From TESTING.md and development plans.

## GitHub Actions Setup

1. **Repository Secrets**:
   - In GitHub repo Settings > Secrets and variables > Actions:
     - HF_TOKEN: For HF Spaces deploys.
     - DOCKER_USERNAME/PASSWORD: For image pushes.
     - VERCEL_TOKEN: For frontend deploys.
     - ORACLE_CLOUD_KEY: For backend deploys (if automated).
     - JWT_SECRET, API keys for tests.

2. **Workflow Structure**:
   - Workflows in `.github/workflows/` (create if not present).
   - Triggers: push/pull_request to main/develop.
   - Jobs: lint, test, build, deploy (conditional on branch).

## Backend CI/CD (Orchestrator)

Pipeline for Python backend: Lint, test, build Docker, deploy to Oracle.

Example `.github/workflows/backend.yml`:
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install black isort flake8 mypy
      - run: black --check .
      - run: isort --check .
      - run: flake8 .
      - run: mypy .

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements-dev.txt
      - run: docker build -t vibe-orchestrator .
      - run: docker run -d -p 5432:5432 --env POSTGRES_PASSWORD=postgres postgres:15
      - run: docker run -d -p 6379:6379 redis:7
      - run: alembic upgrade head
      - run: pytest --cov=. --cov-report=xml
      - uses: codecov/codecov-action@v3

  build:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t vibe-orchestrator:${{ github.sha }} .
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push vibe-orchestrator:${{ github.sha }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Oracle
        run: |
          # SCP to instance, docker pull, compose up
          echo "Deploy script here"
```

- Lint: Black, flake8, mypy.
- Test: Pytest with Docker services (DB, Redis); coverage report.
- Build: Docker image, push to registry.
- Deploy: SSH to Oracle, pull image, docker compose up -d.

## Frontend CI/CD

Pipeline for Next.js: Lint, test, deploy to Vercel.

Example `.github/workflows/frontend.yml`:
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test --ci --coverage
      - run: npx playwright test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifact
          path: .next

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

- Lint: ESLint/Prettier.
- Test: Vitest + Playwright E2E.
- Deploy: Vercel action; sets env vars automatically.

## MCP CI/CD

For MCPs (e.g., custom like libraries-io):

Example `.github/workflows/mcp.yml` (in custom-mcp dir):
```yaml
name: MCP CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest

  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t mcp-image:latest .
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push mcp-image:latest
      - name: Deploy to HF
        run: |
          # HF CLI or API to update Space
          echo "HF deploy script"
```

- Test: Pytest for tools.
- Deploy: Build Docker, push, trigger HF Space update (via HF API or manual push).

## Full Pipeline Orchestration

- **Matrix Testing**: Run on multiple Node/Python versions.
- **Security Scan**: Add Semgrep step in workflows.
- **Notifications**: Slack/email on failure.
- **Approval Gates**: For deploys, manual approval.

From TESTING.md: GitHub Actions for all; coverage reports.

For production: Secure secrets, multi-stage deploys.

Back to [Deployment Index](index.md).