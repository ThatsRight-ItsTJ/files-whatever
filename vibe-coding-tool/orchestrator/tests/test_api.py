"""
Test API endpoints for the Vibe Coding Tool backend
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from tests.conftest import assert_api_success, assert_api_error


class TestAuthAPI:
    """Test authentication API endpoints"""
    
    @pytest.mark.unit
    def test_register_user(self, client, test_user_data):
        """Test user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        assert_api_success(response, 201)
        assert "user_id" in response.json()
    
    @pytest.mark.unit
    def test_register_duplicate_user(self, client, test_user_data):
        """Test registering duplicate user"""
        # Register user first time
        client.post("/api/auth/register", json=test_user_data)
        
        # Try to register same user again
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["error"]
    
    @pytest.mark.unit
    def test_login_user(self, client, test_user_data):
        """Test user login"""
        # Register user first
        client.post("/api/auth/register", json=test_user_data)
        
        # Login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        assert_api_success(response)
        assert "access_token" in response.json()
        assert "token_type" in response.json()
    
    @pytest.mark.unit
    def test_login_invalid_credentials(self, client, test_user_data):
        """Test login with invalid credentials"""
        # Register user first
        client.post("/api/auth/register", json=test_user_data)
        
        # Try to login with wrong password
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["error"]
    
    @pytest.mark.unit
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user profile"""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert_api_success(response)
        assert "email" in response.json()
        assert "username" in response.json()
    
    @pytest.mark.unit
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without auth"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401
    
    @pytest.mark.unit
    def test_refresh_token(self, client, auth_headers):
        """Test refreshing access token"""
        response = client.post("/api/auth/refresh", headers=auth_headers)
        assert_api_success(response)
        assert "access_token" in response.json()


class TestUserAPI:
    """Test user management API endpoints"""
    
    @pytest.mark.unit
    def test_get_user_profile(self, client, auth_headers, test_user):
        """Test getting user profile"""
        response = client.get(f"/api/users/{test_user.id}", headers=auth_headers)
        assert_api_success(response)
        assert response.json()["email"] == test_user.email
    
    @pytest.mark.unit
    def test_update_user_profile(self, client, auth_headers, test_user):
        """Test updating user profile"""
        update_data = {
            "full_name": "Updated Name",
            "bio": "Updated bio"
        }
        response = client.put(
            f"/api/users/{test_user.id}", 
            json=update_data, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["full_name"] == "Updated Name"
    
    @pytest.mark.unit
    def test_get_user_projects(self, client, auth_headers, test_project):
        """Test getting user's projects"""
        response = client.get("/api/users/projects", headers=auth_headers)
        assert_api_success(response)
        assert len(response.json()) == 1
        assert response.json()[0]["name"] == test_project.name
    
    @pytest.mark.unit
    def test_get_user_tasks(self, client, auth_headers, test_task):
        """Test getting user's tasks"""
        response = client.get("/api/users/tasks", headers=auth_headers)
        assert_api_success(response)
        assert len(response.json()) == 1
        assert response.json()[0]["type"] == test_task.type


class TestProjectAPI:
    """Test project management API endpoints"""
    
    @pytest.mark.unit
    def test_create_project(self, client, auth_headers, test_project_data):
        """Test creating a new project"""
        response = client.post(
            "/api/projects/", 
            json=test_project_data, 
            headers=auth_headers
        )
        assert_api_success(response, 201)
        assert response.json()["name"] == test_project_data["name"]
    
    @pytest.mark.unit
    def test_get_project(self, client, auth_headers, test_project):
        """Test getting a specific project"""
        response = client.get(
            f"/api/projects/{test_project.id}", 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["name"] == test_project.name
    
    @pytest.mark.unit
    def test_update_project(self, client, auth_headers, test_project):
        """Test updating a project"""
        update_data = {
            "name": "Updated Project Name",
            "description": "Updated description"
        }
        response = client.put(
            f"/api/projects/{test_project.id}", 
            json=update_data, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["name"] == "Updated Project Name"
    
    @pytest.mark.unit
    def test_delete_project(self, client, auth_headers, test_project):
        """Test deleting a project"""
        response = client.delete(
            f"/api/projects/{test_project.id}", 
            headers=auth_headers
        )
        assert_api_success(response)
        
        # Verify project is deleted
        get_response = client.get(
            f"/api/projects/{test_project.id}", 
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    @pytest.mark.unit
    def test_list_projects(self, client, auth_headers, test_project):
        """Test listing user's projects"""
        response = client.get("/api/projects/", headers=auth_headers)
        assert_api_success(response)
        assert len(response.json()) == 1
        assert response.json()[0]["name"] == test_project.name
    
    @pytest.mark.unit
    def test_create_project_unauthorized(self, client, test_project_data):
        """Test creating project without auth"""
        response = client.post("/api/projects/", json=test_project_data)
        assert response.status_code == 401


class TestTaskAPI:
    """Test task management API endpoints"""
    
    @pytest.mark.unit
    def test_create_task(self, client, auth_headers, test_task_data, test_project):
        """Test creating a new task"""
        task_data = {
            **test_task_data,
            "project_id": test_project.id
        }
        response = client.post(
            "/api/tasks/", 
            json=task_data, 
            headers=auth_headers
        )
        assert_api_success(response, 201)
        assert response.json()["type"] == test_task_data["type"]
    
    @pytest.mark.unit
    def test_get_task(self, client, auth_headers, test_task):
        """Test getting a specific task"""
        response = client.get(
            f"/api/tasks/{test_task.id}", 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["type"] == test_task.type
    
    @pytest.mark.unit
    def test_update_task_status(self, client, auth_headers, test_task):
        """Test updating task status"""
        update_data = {
            "status": "completed",
            "result": {"output": "Task completed successfully"}
        }
        response = client.patch(
            f"/api/tasks/{test_task.id}/status", 
            json=update_data, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["status"] == "completed"
    
    @pytest.mark.unit
    def test_list_tasks(self, client, auth_headers, test_task):
        """Test listing tasks"""
        response = client.get("/api/tasks/", headers=auth_headers)
        assert_api_success(response)
        assert len(response.json()) == 1
        assert response.json()[0]["type"] == test_task.type
    
    @pytest.mark.unit
    def test_list_tasks_by_project(self, client, auth_headers, test_task, test_project):
        """Test listing tasks for a specific project"""
        response = client.get(
            f"/api/projects/{test_project.id}/tasks", 
            headers=auth_headers
        )
        assert_api_success(response)
        assert len(response.json()) == 1
        assert response.json()[0]["type"] == test_task.type
    
    @pytest.mark.unit
    def test_cancel_task(self, client, auth_headers, test_task):
        """Test canceling a task"""
        response = client.post(
            f"/api/tasks/{test_task.id}/cancel", 
            headers=auth_headers
        )
        assert_api_success(response)
        assert response.json()["status"] == "cancelled"


class TestMCPAPI:
    """Test MCP management API endpoints"""
    
    @pytest.mark.unit
    def test_list_mcps(self, client, auth_headers):
        """Test listing available MCPs"""
        response = client.get("/api/mcps/", headers=auth_headers)
        assert_api_success(response)
        assert isinstance(response.json(), list)
    
    @pytest.mark.unit
    def test_get_mcp_capabilities(self, client, auth_headers, mock_mcp_server):
        """Test getting MCP capabilities"""
        with patch('app.api.mcp.get_mcp_server') as mock_get:
            mock_get.return_value = mock_mcp_server
            
            response = client.get(
                "/api/mcps/test-mcp/capabilities", 
                headers=auth_headers
            )
            assert_api_success(response)
            assert "tools" in response.json()
    
    @pytest.mark.unit
    def test_execute_mcp_tool(self, client, auth_headers, mock_mcp_server):
        """Test executing an MCP tool"""
        with patch('app.api.mcp.get_mcp_server') as mock_get:
            mock_get.return_value = mock_mcp_server
            
            tool_request = {
                "tool": "test_tool",
                "arguments": {"input": "test input"}
            }
            
            response = client.post(
                "/api/mcps/test-mcp/execute", 
                json=tool_request, 
                headers=auth_headers
            )
            assert_api_success(response)
            assert "result" in response.json()
    
    @pytest.mark.unit
    def test_mcp_health_check(self, client, auth_headers):
        """Test MCP health check"""
        response = client.get("/api/mcps/health", headers=auth_headers)
        assert_api_success(response)
        assert "status" in response.json()


class TestKGAPI:
    """Test knowledge graph API endpoints"""
    
    @pytest.mark.unit
    def test_generate_kg(self, client, auth_headers, test_project):
        """Test generating knowledge graph for a project"""
        kg_request = {
            "project_id": test_project.id,
            "include_code_analysis": True,
            "include_dependencies": True
        }
        
        response = client.post(
            "/api/kg/generate", 
            json=kg_request, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert "kg_id" in response.json()
    
    @pytest.mark.unit
    def test_get_project_kg(self, client, auth_headers, test_project):
        """Test getting project's knowledge graph"""
        response = client.get(
            f"/api/kg/projects/{test_project.id}", 
            headers=auth_headers
        )
        assert_api_success(response)
        assert "nodes" in response.json()
        assert "edges" in response.json()
    
    @pytest.mark.unit
    def test_query_kg(self, client, auth_headers, test_project):
        """Test querying knowledge graph"""
        query_request = {
            "project_id": test_project.id,
            "query": "Find all functions in the project"
        }
        
        response = client.post(
            "/api/kg/query", 
            json=query_request, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert "results" in response.json()
    
    @pytest.mark.unit
    def test_update_kg(self, client, auth_headers, test_project):
        """Test updating knowledge graph"""
        update_request = {
            "project_id": test_project.id,
            "updates": [
                {
                    "type": "add_node",
                    "node": {
                        "id": "new_node",
                        "type": "function",
                        "properties": {"name": "new_function"}
                    }
                }
            ]
        }
        
        response = client.post(
            "/api/kg/update", 
            json=update_request, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert "updated" in response.json()


class TestAgentAPI:
    """Test agent management API endpoints"""
    
    @pytest.mark.unit
    def test_list_agents(self, client, auth_headers):
        """Test listing available agents"""
        response = client.get("/api/agents/", headers=auth_headers)
        assert_api_success(response)
        assert isinstance(response.json(), list)
    
    @pytest.mark.unit
    def test_get_agent_templates(self, client, auth_headers):
        """Test getting agent templates"""
        response = client.get("/api/agents/templates", headers=auth_headers)
        assert_api_success(response)
        assert isinstance(response.json(), list)
    
    @pytest.mark.unit
    def test_execute_agent_task(self, client, auth_headers, test_project):
        """Test executing an agent task"""
        agent_request = {
            "agent_id": "code-generator",
            "task": "Create a React component",
            "context": {
                "project_id": test_project.id,
                "framework": "react"
            }
        }
        
        response = client.post(
            "/api/agents/execute", 
            json=agent_request, 
            headers=auth_headers
        )
        assert_api_success(response)
        assert "task_id" in response.json()
    
    @pytest.mark.unit
    def test_create_custom_agent(self, client, auth_headers):
        """Test creating a custom agent"""
        agent_config = {
            "name": "Custom Code Reviewer",
            "description": "Reviews code for best practices",
            "model": "gpt-4",
            "instructions": "Review code for security and performance",
            "tools": ["code-analyzer", "security-scanner"]
        }
        
        response = client.post(
            "/api/agents/custom", 
            json=agent_config, 
            headers=auth_headers
        )
        assert_api_success(response, 201)
        assert response.json()["name"] == "Custom Code Reviewer"


class TestErrorHandling:
    """Test error handling for various scenarios"""
    
    @pytest.mark.unit
    def test_404_error(self, client, auth_headers):
        """Test 404 error handling"""
        response = client.get("/api/nonexistent-endpoint", headers=auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.unit
    def test_validation_error(self, client, auth_headers):
        """Test validation error handling"""
        invalid_data = {
            "email": "invalid-email",
            "password": "short"
        }
        response = client.post("/api/auth/register", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
    
    @pytest.mark.unit
    def test_permission_error(self, client, auth_headers, test_project):
        """Test permission error handling"""
        # Try to access another user's project (simulated)
        response = client.get(f"/api/projects/{test_project.id + 1}", headers=auth_headers)
        assert response.status_code == 404


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    @pytest.mark.unit
    def test_rate_limiting(self, client):
        """Test that rate limiting is enforced"""
        # Make many requests in quick succession
        for i in range(100):
            response = client.get("/api/mcps/health")
        
        # Should eventually get 429 Too Many Requests
        assert response.status_code == 429


class TestSecurity:
    """Test security aspects"""
    
    @pytest.mark.unit
    def test_sql_injection_protection(self, client):
        """Test protection against SQL injection"""
        malicious_input = {
            "email": "test@example.com'; DROP TABLE users; --",
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=malicious_input)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.unit
    def test_xss_protection(self, client):
        """Test protection against XSS attacks"""
        malicious_input = {
            "name": "<script>alert('xss')</script>",
            "description": "Normal description"
        }
        response = client.post("/api/projects/", json=malicious_input)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.unit
    def test_csrf_protection(self, client, auth_headers):
        """Test CSRF protection"""
        # Try to make a request without proper headers
        response = client.post("/api/projects/", json={"name": "test"})
        assert response.status_code == 401  # Unauthorized


if __name__ == "__main__":
    pytest.main([__file__])