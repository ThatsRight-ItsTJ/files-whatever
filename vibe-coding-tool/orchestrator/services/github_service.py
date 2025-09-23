from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
import logging

from models.user import User
from config.settings import settings

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.client_id = settings.github_client_id
        self.client_secret = settings.github_client_secret
        self.redirect_uri = settings.github_redirect_uri
    
    async def get_authorization_url(self, state: str) -> str:
        """Get GitHub authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "repo user:email workflow",
            "state": state
        }
        
        return f"{self.base_url}/login/oauth/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
    
    async def exchange_code_for_token(self, code: str) -> Optional[str]:
        """Exchange authorization code for access token"""
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/login/oauth/access_token",
                data=data,
                headers={"Accept": "application/json"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get("access_token")
        
        return None
    
    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user information from GitHub"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user",
                headers={"Authorization": f"token {access_token}"}
            )
            
            if response.status_code == 200:
                return response.json()
        
        return None
    
    async def get_user_repos(self, access_token: str) -> List[Dict[str, Any]]:
        """Get user's repositories"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/repos",
                headers={"Authorization": f"token {access_token}"},
                params={"type": "all", "sort": "updated", "per_page": 100}
            )
            
            if response.status_code == 200:
                return response.json()
        
        return []
    
    async def create_repo(self, access_token: str, repo_name: str, description: str = "") -> Optional[Dict[str, Any]]:
        """Create a new repository"""
        data = {
            "name": repo_name,
            "description": description,
            "private": False,
            "auto_init": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/user/repos",
                headers={"Authorization": f"token {access_token}"},
                json=data
            )
            
            if response.status_code == 201:
                return response.json()
        
        return None
    
    async def get_repo_contents(self, access_token: str, owner: str, repo: str, path: str = "") -> List[Dict[str, Any]]:
        """Get repository contents"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers={"Authorization": f"token {access_token}"}
            )
            
            if response.status_code == 200:
                return response.json() if isinstance(response.json(), list) else [response.json()]
        
        return []
    
    async def get_file_content(self, access_token: str, owner: str, repo: str, path: str) -> Optional[str]:
        """Get file content"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers={"Authorization": f"token {access_token}"}
            )
            
            if response.status_code == 200:
                file_data = response.json()
                return file_data.get("content")
        
        return None
    
    async def create_file(self, access_token: str, owner: str, repo: str, path: str, content: str, message: str) -> Optional[Dict[str, Any]]:
        """Create or update a file"""
        data = {
            "message": message,
            "content": content,
            "branch": "main"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers={"Authorization": f"token {access_token}"},
                json=data
            )
            
            if response.status_code == 201 or response.status_code == 200:
                return response.json()
        
        return None