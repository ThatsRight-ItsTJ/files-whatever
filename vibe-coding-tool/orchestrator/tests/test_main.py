"""
Test suite for the main application
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from datetime import datetime

from main import app
from models.task import Task, TaskStatus, TaskPriority
from models.job import Job, JobStatus
from models.mcp import MCPInfo, MCPStatus, Capability, RoutingFlags
from models.response import StandardResponse
from core.job_manager import JobManager
from core.registry import MCPRegistry
from core.result_manager import ResultManager
from core.auth_service import AuthService


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def mock_auth_service():
    """Mock auth service"""
    return Mock(spec=AuthService)


@pytest.fixture
def mock_registry():
    """Mock MCP registry"""
    return Mock(spec=MCPRegistry)


@pytest.fixture
def mock_job_manager():
    """Mock job manager"""
    return Mock(spec=JobManager)


@pytest.fixture
def mock_result_manager():
    """Mock result manager"""
    return Mock(spec=ResultManager)


@pytest.fixture
def sample_task():
    """Sample task for testing"""
    return Task(
        id="test_task_1",
        user_id="test_user_1",
        type="file_operations",
        status=TaskStatus.PENDING,
        input={"repo": "test/repo", "path": "/src/main.py"},
        parameters={"timeout": 300},
        priority=TaskPriority.NORMAL,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@pytest.fixture
def sample_mcp():
    """Sample MCP for testing"""
    return MCPInfo(
        id="test_mcp_1",
        name="Test MCP",
        url="https://test-mcp.example.com",
        status=MCPStatus.HEALTHY,
        capabilities=[
            Capability(name="file_operations", version="1.0.0", parameters={"read", "write"})
        ],
        supported_task_types=["file_operations"],
        routing_flags=RoutingFlags(
            can_run_on_user_space=False,
            result_pointer_preferred=False,
            fallback_to_oracle=True,
            priority=1,
            max_concurrent_jobs=5,
            timeout=300
        ),
        description="Test MCP for file operations",
        metadata={}
    )


class TestMainApp:
    """Test the main application"""
    
    def test_health_endpoint(self, client):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
    
    def test_metrics_endpoint(self, client):
        """Test metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "start_time" in data
        assert "uptime" in data
        assert "requests" in data
        assert "jobs" in data
        assert "mcps" in data
    
    def test_create_task_endpoint(self, client, sample_task):
        """Test create task endpoint"""
        with patch('main.create_task') as mock_create:
            mock_create.return_value = sample_task
            
            response = client.post("/api/tasks/create", json={
                "type": "file_operations",
                "input": {"repo": "test/repo", "path": "/src/main.py"},
                "parameters": {"timeout": 300},
                "priority": "normal"
            })
            
            assert response.status_code == 201
            data = response.json()
            assert data["id"] == sample_task.id
            assert data["status"] == "pending"
    
    def test_get_task_endpoint(self, client, sample_task):
        """Test get task endpoint"""
        with patch('main.get_task') as mock_get:
            mock_get.return_value = sample_task
            
            response = client.get(f"/api/tasks/{sample_task.id}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == sample_task.id
            assert data["status"] == "pending"
    
    def test_list_tasks_endpoint(self, client, sample_task):
        """Test list tasks endpoint"""
        with patch('main.list_tasks') as mock_list:
            mock_list.return_value = [sample_task]
            
            response = client.get("/api/tasks/list")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == sample_task.id
    
    def test_create_mcp_endpoint(self, client, sample_mcp):
        """Test create MCP endpoint"""
        with patch('main.register_mcp') as mock_register:
            mock_register.return_value = sample_mcp
            
            response = client.post("/api/mcps/create", json={
                "name": "Test MCP",
                "url": "https://test-mcp.example.com",
                "capabilities": [
                    {
                        "name": "file_operations",
                        "version": "1.0.0",
                        "parameters": ["read", "write"]
                    }
                ],
                "supported_task_types": ["file_operations"]
            })
            
            assert response.status_code == 201
            data = response.json()
            assert data["id"] == sample_mcp.id
            assert data["name"] == "Test MCP"
    
    def test_get_mcp_endpoint(self, client, sample_mcp):
        """Test get MCP endpoint"""
        with patch('main.get_mcp') as mock_get:
            mock_get.return_value = sample_mcp
            
            response = client.get(f"/api/mcps/{sample_mcp.id}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == sample_mcp.id
            assert data["name"] == "Test MCP"
    
    def test_list_mcps_endpoint(self, client, sample_mcp):
        """Test list MCPs endpoint"""
        with patch('main.list_mcps') as mock_list:
            mock_list.return_value = [sample_mcp]
            
            response = client.get("/api/mcps/list")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == sample_mcp.id
    
    def test_get_mcp_stats_endpoint(self, client):
        """Test get MCP stats endpoint"""
        with patch('main.get_mcp_stats') as mock_stats:
            mock_stats.return_value = {
                "total_mcps": 3,
                "healthy_mcps": 2,
                "unhealthy_mcps": 1,
                "user_space_mcps": 1,
                "oracle_mcps": 2
            }
            
            response = client.get("/api/mcps/stats")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_mcps"] == 3
            assert data["healthy_mcps"] == 2
            assert data["unhealthy_mcps"] == 1
    
    def test_get_user_profile_endpoint(self, client):
        """Test get user profile endpoint"""
        with patch('main.get_user_profile') as mock_profile:
            mock_profile.return_value = {
                "id": "test_user_1",
                "email": "test@example.com",
                "created_at": "2025-01-01T00:00:00Z",
                "preferences": {"theme": "dark"}
            }
            
            response = client.get("/api/user/profile")
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "test_user_1"
            assert data["email"] == "test@example.com"
    
    def test_update_user_settings_endpoint(self, client):
        """Test update user settings endpoint"""
        with patch('main.update_user_settings') as mock_update:
            mock_update.return_value = {"success": True}
            
            response = client.put("/api/user/settings", json={
                "preferences": {"theme": "light"}
            })
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_get_task_history_endpoint(self, client, sample_task):
        """Test get task history endpoint"""
        with patch('main.get_task_history') as mock_history:
            mock_history.return_value = [sample_task]
            
            response = client.get("/api/tasks/history")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == sample_task.id
    
    def test_cancel_task_endpoint(self, client, sample_task):
        """Test cancel task endpoint"""
        with patch('main.cancel_task') as mock_cancel:
            mock_cancel.return_value = {"success": True}
            
            response = client.post(f"/api/tasks/{sample_task.id}/cancel")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_error_handling(self, client):
        """Test error handling"""
        with patch('main.create_task') as mock_create:
            mock_create.side_effect = Exception("Test error")
            
            response = client.post("/api/tasks/create", json={
                "type": "invalid_type",
                "input": {}
            })
            
            assert response.status_code == 500
            data = response.json()
            assert "error" in data


class TestJobManager:
    """Test the JobManager class"""
    
    def test_create_job(self, sample_task, sample_mcp):
        """Test job creation"""
        job_manager = JobManager()
        
        # Mock dependencies
        job_manager.task_router = Mock()
        job_manager.result_manager = Mock()
        job_manager.registry = Mock()
        
        job = asyncio.run(job_manager.create_job(sample_task, sample_mcp))
        
        assert job.id.startswith("job_")
        assert job.task_id == sample_task.id
        assert job.mcp_id == sample_mcp.id
        assert job.user_id == sample_task.user_id
        assert job.status == JobStatus.PENDING
    
    def test_get_job_status(self, sample_task, sample_mcp):
        """Test getting job status"""
        job_manager = JobManager()
        
        # Create a job first
        job = asyncio.run(job_manager.create_job(sample_task, sample_mcp))
        
        # Mock dependencies
        job_manager.task_router = Mock()
        job_manager.result_manager = Mock()
        job_manager.registry = Mock()
        
        # Update job status
        job.status = JobStatus.RUNNING
        job_manager.jobs[job.id] = job
        
        status = asyncio.run(job_manager.get_job_status(job.id))
        
        assert status == JobStatus.RUNNING
    
    def test_handle_failure(self, sample_task, sample_mcp):
        """Test handling job failure"""
        job_manager = JobManager()
        
        # Create a job first
        job = asyncio.run(job_manager.create_job(sample_task, sample_mcp))
        
        # Mock dependencies
        job_manager.task_router = Mock()
        job_manager.result_manager = Mock()
        job_manager.registry = Mock()
        
        # Update job status
        job.status = JobStatus.RUNNING
        job_manager.jobs[job.id] = job
        
        # Handle failure
        asyncio.run(job_manager.handle_failure(job, Exception("Test error")))
        
        # Check that job was moved to failed jobs
        assert job.id in job_manager.failed_jobs
        assert job_manager.failed_jobs[job.id].status == JobStatus.FAILED


class TestMCPRegistry:
    """Test the MCPRegistry class"""
    
    def test_register_mcp(self, sample_mcp):
        """Test MCP registration"""
        registry = MCPRegistry()
        
        result = asyncio.run(registry.register_mcp(sample_mcp))
        
        assert result is True
        assert sample_mcp.id in registry.mcps
        assert registry.metrics["total_mcps"] == 1
    
    def test_unregister_mcp(self, sample_mcp):
        """Test MCP unregistration"""
        registry = MCPRegistry()
        
        # Register first
        asyncio.run(registry.register_mcp(sample_mcp))
        
        # Then unregister
        result = asyncio.run(registry.unregister_mcp(sample_mcp.id))
        
        assert result is True
        assert sample_mcp.id not in registry.mcps
        assert registry.metrics["total_mcps"] == 0
    
    def test_get_mcp(self, sample_mcp):
        """Test getting MCP by ID"""
        registry = MCPRegistry()
        
        # Register first
        asyncio.run(registry.register_mcp(sample_mcp))
        
        # Then get
        result = asyncio.run(registry.get_mcp(sample_mcp.id))
        
        assert result is not None
        assert result.id == sample_mcp.id
    
    def test_get_mcps_for_task(self, sample_mcp):
        """Test getting MCPs for task type"""
        registry = MCPRegistry()
        
        # Register first
        asyncio.run(registry.register_mcp(sample_mcp))
        
        # Then get for task
        result = asyncio.run(registry.get_mcps_for_task("file_operations"))
        
        assert len(result) == 1
        assert result[0].id == sample_mcp.id
    
    def test_check_mcp_health(self, sample_mcp):
        """Test MCP health check"""
        registry = MCPRegistry()
        
        # Register first
        asyncio.run(registry.register_mcp(sample_mcp))
        
        # Then check health
        result = asyncio.run(registry.check_mcp_health(sample_mcp.id))
        
        # Should return True or False (random in mock)
        assert isinstance(result, bool)
    
    def test_get_mcp_stats(self, sample_mcp):
        """Test getting MCP stats"""
        registry = MCPRegistry()
        
        # Register first
        asyncio.run(registry.register_mcp(sample_mcp))
        
        # Then get stats
        result = asyncio.run(registry.get_mcp_stats())
        
        assert "total_mcps" in result
        assert "healthy_mcps" in result
        assert "unhealthy_mcps" in result
        assert result["total_mcps"] == 1


class TestResultManager:
    """Test the ResultManager class"""
    
    def test_store_result(self, sample_task, sample_mcp):
        """Test storing result"""
        result_manager = ResultManager()
        
        result_data = {"output": "Test result"}
        result = asyncio.run(result_manager.store_result(
            sample_task.user_id,
            f"job_{sample_task.id}",
            result_data
        ))
        
        assert result.id.startswith("result_")
        assert result.user_id == sample_task.user_id
        assert result.data == result_data
    
    def test_get_result(self, sample_task, sample_mcp):
        """Test getting result"""
        result_manager = ResultManager()
        
        # Store first
        result_data = {"output": "Test result"}
        result = asyncio.run(result_manager.store_result(
            sample_task.user_id,
            f"job_{sample_task.id}",
            result_data
        ))
        
        # Then get
        retrieved_result = asyncio.run(result_manager.get_result(
            sample_task.user_id,
            result.id
        ))
        
        assert retrieved_result is not None
        assert retrieved_result.id == result.id
        assert retrieved_result.data == result_data
    
    def test_get_user_results(self, sample_task, sample_mcp):
        """Test getting user results"""
        result_manager = ResultManager()
        
        # Store multiple results
        for i in range(3):
            result_data = {"output": f"Test result {i}"}
            asyncio.run(result_manager.store_result(
                sample_task.user_id,
                f"job_{sample_task.id}_{i}",
                result_data
            ))
        
        # Then get user results
        results = asyncio.run(result_manager.get_user_results(sample_task.user_id))
        
        assert len(results) == 3
    
    def test_delete_result(self, sample_task, sample_mcp):
        """Test deleting result"""
        result_manager = ResultManager()
        
        # Store first
        result_data = {"output": "Test result"}
        result = asyncio.run(result_manager.store_result(
            sample_task.user_id,
            f"job_{sample_task.id}",
            result_data
        ))
        
        # Then delete
        success = asyncio.run(result_manager.delete_result(
            sample_task.user_id,
            result.id
        ))
        
        assert success is True
        assert result.id not in result_manager.results
    
    def test_get_result_stats(self, sample_task, sample_mcp):
        """Test getting result stats"""
        result_manager = ResultManager()
        
        # Store some results
        for i in range(3):
            result_data = {"output": f"Test result {i}"}
            asyncio.run(result_manager.store_result(
                sample_task.user_id,
                f"job_{sample_task.id}_{i}",
                result_data
            ))
        
        # Then get stats
        stats = asyncio.run(result_manager.get_result_stats())
        
        assert "metrics" in stats
        assert "cache_size" in stats
        assert "total_results" in stats
        assert stats["total_results"] == 3


if __name__ == "__main__":
    pytest.main([__file__])