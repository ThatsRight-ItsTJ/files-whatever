"""
Pytest configuration for Vibe Coding Tool backend tests
"""

import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User
from app.models.project import Project
from app.models.task import Task

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/vibe_test"

# Create async test engine
engine = create_async_engine(TEST_DATABASE_URL, echo=True)
AsyncTestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Create the test database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session():
    """Create a test database session"""
    async with AsyncTestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Create an async test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def test_user_data():
    """Return test user data"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User"
    }

@pytest.fixture
async def test_user(db_session):
    """Create a test user"""
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

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers for API requests"""
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def test_project_data():
    """Return test project data"""
    return {
        "name": "Test Project",
        "description": "A test project for testing",
        "repository_url": "https://github.com/test/test-project",
        "framework": "nextjs"
    }

@pytest.fixture
async def test_project(db_session, test_user):
    """Create a test project"""
    project_data = test_project_data()
    project = Project(
        name=project_data["name"],
        description=project_data["description"],
        repository_url=project_data["repository_url"],
        framework=project_data["framework"],
        user_id=test_user.id
    )
    
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    
    return project

@pytest.fixture
def test_task_data():
    """Return test task data"""
    return {
        "type": "code-generation",
        "input": {"prompt": "Write a hello world function"},
        "priority": "normal"
    }

@pytest.fixture
async def test_task(db_session, test_user, test_project):
    """Create a test task"""
    task_data = test_task_data()
    task = Task(
        type=task_data["type"],
        input=task_data["input"],
        priority=task_data["priority"],
        user_id=test_user.id,
        project_id=test_project.id
    )
    
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    
    return task

@pytest.fixture
def mock_mcp_server():
    """Mock MCP server for testing"""
    return {
        "id": "test-mcp",
        "name": "Test MCP Server",
        "version": "1.0.0",
        "capabilities": {
            "tools": [
                {
                    "name": "test_tool",
                    "description": "A test tool",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "input": {"type": "string"}
                        }
                    }
                }
            ]
        },
        "status": "healthy"
    }

@pytest.fixture
def mock_redis():
    """Mock Redis client for testing"""
    class MockRedis:
        def __init__(self):
            self.data = {}
        
        async def get(self, key):
            return self.data.get(key)
        
        async def set(self, key, value, ex=None):
            self.data[key] = value
            return True
        
        async def delete(self, key):
            if key in self.data:
                del self.data[key]
                return 1
            return 0
        
        async def exists(self, key):
            return key in self.data
        
        async def expire(self, key, seconds):
            if key in self.data:
                return True
            return False
        
        async def flushdb(self):
            self.data.clear()
            return True
    
    return MockRedis()

@pytest.fixture
def mock_github_api():
    """Mock GitHub API for testing"""
    class MockGitHubAPI:
        def __init__(self):
            self.repos = {}
            self.users = {}
        
        async def get_user(self, username):
            return self.users.get(username)
        
        async def get_repo(self, owner, repo):
            return self.repos.get(f"{owner}/{repo}")
        
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
        
        async def get_repo_contents(self, owner, repo, path=""):
            return [
                {
                    "name": "README.md",
                    "type": "file",
                    "download_url": "https://raw.githubusercontent.com/test/test/main/README.md"
                }
            ]
    
    return MockGitHubAPI()

@pytest.fixture
def mock_huggingface_api():
    """Mock HuggingFace API for testing"""
    class MockHuggingFaceAPI:
        def __init__(self):
            self.spaces = {}
            self.datasets = {}
        
        async def create_space(self, name, framework="gradio"):
            space_id = len(self.spaces) + 1
            space = {
                "id": space_id,
                "name": name,
                "framework": framework,
                "sdk": "gradio",
                "hardware": "cpu-basic",
                "runtime": "python3",
                "url": f"https://huggingface.co/spaces/testuser/{name}"
            }
            self.spaces[name] = space
            return space
        
        async def get_space(self, name):
            return self.spaces.get(name)
        
        async def upload_dataset(self, name, data):
            dataset_id = len(self.datasets) + 1
            dataset = {
                "id": dataset_id,
                "name": name,
                "size": len(str(data)),
                "private": False,
                "author": "testuser"
            }
            self.datasets[name] = dataset
            return dataset
    
    return MockHuggingFaceAPI()

@pytest.fixture
def metrics_data():
    """Return sample metrics data for testing"""
    return {
        "http_requests_total": 100,
        "http_request_duration_seconds": 0.5,
        "mcp_queue_length": 5,
        "mcp_server_health": 1,
        "active_users": 10,
        "total_projects": 25,
        "total_tasks": 150
    }

# Test markers
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "mcp: mark test as MCP related"
    )

# Custom assertions
def assert_task_status(task, expected_status):
    """Assert that a task has the expected status"""
    assert task.status == expected_status

def assert_project_ownership(project, user):
    """Assert that a project is owned by the expected user"""
    assert project.user_id == user.id

def assert_api_success(response, status_code=200):
    """Assert that an API response is successful"""
    assert response.status_code == status_code
    assert response.json()["success"] is True

def assert_api_error(response, status_code=400):
    """Assert that an API response is an error"""
    assert response.status_code == status_code
    assert "error" in response.json()