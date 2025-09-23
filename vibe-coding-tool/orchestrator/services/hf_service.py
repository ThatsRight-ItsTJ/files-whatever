from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
import logging

from models.user import User
from config.settings import settings

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self):
        self.base_url = "https://huggingface.co"
        self.api_url = "https://huggingface.co/api"
        self.client_id = settings.hf_client_id
        self.client_secret = settings.hf_client_secret
        self.redirect_uri = settings.hf_redirect_uri
    
    async def get_authorization_url(self, state: str) -> str:
        """Get HuggingFace authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "read write",
            "state": state,
            "response_type": "code"
        }
        
        return f"{self.base_url}/oauth/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
    
    async def exchange_code_for_token(self, code: str) -> Optional[str]:
        """Exchange authorization code for access token"""
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/oauth/token",
                data=data
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get("access_token")
        
        return None
    
    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user information from HuggingFace"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/whoami",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code == 200:
                return response.json()
        
        return None
    
    async def get_user_spaces(self, access_token: str) -> List[Dict[str, Any]]:
        """Get user's Spaces"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/spaces",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"author": "me", "sort": "modified", "limit": 50}
            )
            
            if response.status_code == 200:
                return response.json()
        
        return []
    
    async def create_space(self, access_token: str, space_name: str, template: str = "gradio/huggingface-space-template") -> Optional[Dict[str, Any]]:
        """Create a new Space"""
        data = {
            "title": space_name,
            "sdk": "gradio",
            "template": template,
            "hardware": "cpu-basic"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/spaces/{access_token.split(':')[0]}/{space_name}",
                headers={"Authorization": f"Bearer {access_token}"},
                json=data
            )
            
            if response.status_code == 201:
                return response.json()
        
        return None
    
    async def get_space_url(self, owner: str, space_name: str) -> str:
        """Get Space URL"""
        return f"{self.base_url}/{owner}/{space_name}"
    
    async def deploy_to_space(self, access_token: str, space_name: str, files: Dict[str, str]) -> bool:
        """Deploy files to Space"""
        try:
            # This would typically use the HuggingFace Hub API
            # For now, return True as a placeholder
            return True
        except Exception as e:
            logger.error(f"Error deploying to Space: {str(e)}")
            return False
    
    async def store_result_pointer(self, user_id: str, pointer_data: Dict[str, Any]) -> str:
        """Store result pointer in user's HF Dataset"""
        try:
            # This would typically use the HuggingFace Hub API
            # For now, return a placeholder ID
            return f"pointer_{user_id}_{datetime.utcnow().timestamp()}"
        except Exception as e:
            logger.error(f"Error storing result pointer: {str(e)}")
            raise
    
    async def get_result_pointer(self, user_id: str, pointer_id: str) -> Optional[Dict[str, Any]]:
        """Get result pointer from user's HF Dataset"""
        try:
            # This would typically fetch from HuggingFace Hub
            # For now, return None
            return None
        except Exception as e:
            logger.error(f"Error getting result pointer: {str(e)}")
            return None
    
    async def get_result_data(self, user_id: str, pointer_id: str) -> Optional[Dict[str, Any]]:
        """Get actual result data from pointer"""
        try:
            # This would typically fetch from HuggingFace Hub
            # For now, return None
            return None
        except Exception as e:
            logger.error(f"Error getting result data: {str(e)}")
            return None
    
    async def list_user_tasks(self, user_id: str, limit: int = 50, offset: int = 0, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """List user's tasks from HF Dataset"""
        try:
            # This would typically fetch from HuggingFace Hub
            # For now, return empty list
            return []
        except Exception as e:
            logger.error(f"Error listing user tasks: {str(e)}")
            return []
    
    async def get_task_result(self, user_id: str, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task result from HF Dataset"""
        try:
            # This would typically fetch from HuggingFace Hub
            # For now, return None
            return None
        except Exception as e:
            logger.error(f"Error getting task result: {str(e)}")
            return None