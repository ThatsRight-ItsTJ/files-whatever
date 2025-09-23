# Vibe Coding Tool - Testing Documentation

This document provides a comprehensive overview of the testing setup and strategy for the Vibe Coding Tool.

## Testing Architecture

### Frontend Testing (React/TypeScript)

#### Testing Framework
- **Vitest**: Modern testing framework with Vite integration
- **React Testing Library**: Testing React components with user-centric queries
- **Playwright**: End-to-end testing for critical user journeys
- **Jest**: Legacy test runner (migrating to Vitest)

#### Test Structure
```
frontend/src/test/
├── setup.ts                    # Test setup and mocks
├── components/                 # Component tests
│   └── __tests__/
│       └── Button.test.tsx     # Example component test
├── integration/                # Integration tests
│   └── auth.test.ts           # Authentication flow tests
└── utils.ts                   # Test utilities and helpers
```

#### Test Categories

1. **Unit Tests**
   - Individual component logic
   - Utility functions
   - Custom hooks
   - Services and API clients

2. **Integration Tests**
   - Authentication flows
   - API interactions
   - State management
   - Component interactions

3. **E2E Tests**
   - Complete user journeys
   - OAuth flows
   - Project creation
   - Code generation

#### Frontend Test Configuration

**Vitest Config** (`frontend/vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Jest Config** (`frontend/jest.config.js`):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
  ],
}
```

### Backend Testing (Python)

#### Testing Framework
- **pytest**: Python testing framework
- **httpx**: Async HTTP client for testing API endpoints
- **pytest-asyncio**: Async testing support
- **pytest-mock**: Mocking utilities

#### Test Structure
```
orchestrator/tests/
├── conftest.py                # Test fixtures and configuration
├── test_api.py                # API endpoint tests
├── test_services/             # Service layer tests
│   ├── test_auth_service.py
│   ├── test_project_service.py
│   └── test_task_service.py
├── test_models/               # Model tests
│   ├── test_user_model.py
│   ├── test_project_model.py
│   └── test_task_model.py
└── test_utils/                # Utility tests
    └── test_helpers.py
```

#### Test Categories

1. **Unit Tests**
   - Individual service methods
   - Model validation
   - Utility functions
   - Business logic

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - External service integration
   - Authentication flows

3. **Integration Tests**
   - Full application stack
   - Database migrations
   - MCP server communication
   - End-to-end workflows

#### Backend Test Configuration

**Pytest Config** (`orchestrator/pytest.ini`):
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --cov=app
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
    mcp: MCP related tests
asyncio_mode = auto
```

## Test Data Management

### Frontend Test Data

**Mock Data** (`frontend/src/test/utils.ts`):
```typescript
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  ...overrides,
})

export const createMockProject = (overrides = {}) => ({
  id: 'project-123',
  name: 'Test Project',
  description: 'A test project',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})
```

### Backend Test Data

**Fixtures** (`orchestrator/tests/conftest.py`):
```python
@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User"
    }

@pytest.fixture
async def test_user(db_session):
    user_data = test_user_data()
    user = User(
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data["full_name"]
    )
    user.set_password(user_data["password"])
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user
```

## Mocking Strategy

### Frontend Mocking

**API Mocking** (`frontend/src/test/setup.ts`):
```typescript
// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))
```

### Backend Mocking

**External Service Mocking** (`orchestrator/tests/conftest.py`):
```python
@pytest.fixture
def mock_github_api():
    class MockGitHubAPI:
        async def create_repo(self, name, description="", private=False):
            repo_id = len(self.repos) + 1
            repo = {
                "id": repo_id,
                "name": name,
                "description": description,
                "private": private,
                "owner": {"login": "testuser"},
                "html_url": f"https://github.com/testuser/{name}"
            }
            self.repos[f"testuser/{name}"] = repo
            return repo
    
    return MockGitHubAPI()
```

## Test Coverage

### Frontend Coverage Targets

- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: Core user journeys

### Backend Coverage Targets

- **Unit Tests**: 85% coverage
- **Integration Tests**: 75% coverage
- **Load Tests**: 1000 req/min target

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- Button.test.tsx
```

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test category
pytest -m unit
pytest -m integration
pytest -m slow

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

## Continuous Integration

### GitHub Actions

**Frontend CI** (`.github/workflows/frontend.yml`):
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

**Backend CI** (`.github/workflows/backend.yml`):
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: vibe_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-asyncio pytest-mock httpx
      - run: pytest --cov=app --cov-report=xml
      - run: pytest -m integration
```

## Performance Testing

### Load Testing

**Locust Config** (`orchestrator/tests/performance/test_load.py`):
```python
from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(1, 5)
    
    @task
    def create_project(self):
        self.client.post("/api/projects/", json={
            "name": "Load Test Project",
            "description": "A project for load testing"
        })
    
    @task
    def get_projects(self):
        self.client.get("/api/projects/")
    
    @task
    def create_task(self):
        self.client.post("/api/tasks/", json={
            "type": "code-generation",
            "input": {"prompt": "Write a function"}
        })
```

### Stress Testing

**K6 Script** (`orchestrator/tests/performance/stress_test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.post('http://localhost:8000/api/projects/', JSON.stringify({
    name: 'Stress Test Project',
    description: 'A project for stress testing'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'status was 201': (r) => r.status == 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Test Reporting

### Coverage Reports

**Frontend Coverage**:
```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage report
open coverage/index.html
```

**Backend Coverage**:
```bash
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html
```

### Test Results

**JUnit XML Output**:
```bash
# Frontend
npm test -- --coverage --coverage-reporters=junit

# Backend
pytest --junitxml=test-results.xml
```

## Best Practices

### Frontend Testing Best Practices

1. **Test User Behavior, Not Implementation**
   - Use React Testing Library queries
   - Test from user perspective
   - Avoid testing implementation details

2. **Write Descriptive Test Names**
   ```typescript
   test('should display error message when login fails', () => {
     // Test implementation
   })
   ```

3. **Use Mocks Sparingly**
   - Mock external dependencies only
   - Avoid mocking internal implementation
   - Prefer integration tests for complex flows

4. **Test Error Cases**
   - Test invalid inputs
   - Test error states
   - Test loading states

### Backend Testing Best Practices

1. **Use Fixtures for Test Data**
   - Keep test data in fixtures
   - Use factories for complex objects
   - Clean up after tests

2. **Test Both Success and Failure Cases**
   ```python
   def test_create_project_success():
       # Test successful creation
   
   def test_create_project_duplicate_name():
       # Test duplicate name error
   ```

3. **Mock External Services**
   - Use pytest-mock for external APIs
   - Test service isolation
   - Verify mock calls

4. **Write Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test service interactions

## Troubleshooting

### Common Frontend Issues

1. **Test Environment Setup**
   - Ensure all dependencies are installed
   - Check test configuration files
   - Verify mock setup

2. **Test Isolation**
   - Use beforeEach/afterEach for cleanup
   - Reset mock calls between tests
   - Avoid shared test state

### Common Backend Issues

1. **Database Setup**
   - Ensure test database is running
   - Check database connection strings
   - Verify migrations

2. **Async Testing**
   - Use pytest-asyncio
   - Handle async fixtures properly
   - Use async test functions

## Future Improvements

1. **Test Automation**
   - Implement automated test runs
   - Add test reporting to CI/CD
   - Set up test coverage monitoring

2. **Performance Testing**
   - Add load testing to CI
   - Implement stress testing
   - Set up performance benchmarks

3. **Visual Testing**
   - Add visual regression testing
   - Implement screenshot testing
   - Set up visual diffing

4. **Contract Testing**
   - Add API contract testing
   - Implement OpenAPI validation
   - Set up consumer-driven contracts

## Conclusion

This testing setup provides a comprehensive foundation for testing the Vibe Coding Tool. By following the outlined strategies and best practices, we can ensure high-quality code, reliable functionality, and maintainable test suites.

The combination of unit, integration, and E2E tests provides coverage at multiple levels, while the mocking strategy allows for isolated testing of individual components. The CI/CD integration ensures that tests are run automatically, catching issues early in the development process.