"""
Response models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional, List, Generic, TypeVar
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    """Standard API response model"""
    success: bool
    message: str
    data: Optional[T] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response model"""
    success: bool
    message: str
    data: List[T]
    pagination: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    message: str
    error: str
    error_code: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: datetime
    version: str
    uptime: float  # seconds
    services: Dict[str, str]
    metrics: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AuthResponse(BaseModel):
    """Authentication response model"""
    success: bool
    message: str
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class OAuthCallbackResponse(BaseModel):
    """OAuth callback response model"""
    success: bool
    message: str
    code: str
    state: Optional[str] = None
    redirect_url: Optional[str] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TaskResponse(BaseModel):
    """Task response model"""
    success: bool
    message: str
    task_id: str
    status: str
    created_at: datetime
    estimated_completion_time: Optional[datetime] = None
    result_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class JobResponse(BaseModel):
    """Job response model"""
    success: bool
    message: str
    job_id: str
    task_id: str
    mcp_id: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MCPResponse(BaseModel):
    """MCP response model"""
    success: bool
    message: str
    mcp_id: str
    name: str
    status: str
    capabilities: List[Dict[str, Any]]
    health_check: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProjectResponse(BaseModel):
    """Project response model"""
    success: bool
    message: str
    project_id: str
    name: str
    description: Optional[str] = None
    status: str
    visibility: str
    created_at: datetime
    updated_at: datetime
    repository_url: Optional[str] = None
    tags: List[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AgentResponse(BaseModel):
    """Agent response model"""
    success: bool
    message: str
    agent_id: str
    name: str
    description: Optional[str] = None
    type: str
    status: str
    version: str
    created_at: datetime
    updated_at: datetime
    last_used: Optional[datetime] = None
    usage_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class KnowledgeGraphResponse(BaseModel):
    """Knowledge graph response model"""
    success: bool
    message: str
    project_id: str
    graph_id: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StatsResponse(BaseModel):
    """Statistics response model"""
    success: bool
    message: str
    stats: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UploadResponse(BaseModel):
    """Upload response model"""
    success: bool
    message: str
    file_id: str
    filename: str
    size: int  # bytes
    mime_type: str
    url: str
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DownloadResponse(BaseModel):
    """Download response model"""
    success: bool
    message: str
    file_id: str
    filename: str
    size: int  # bytes
    mime_type: str
    url: str
    expires_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WebhookResponse(BaseModel):
    """Webhook response model"""
    success: bool
    message: str
    webhook_id: str
    event: str
    payload: Dict[str, Any]
    processed_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class NotificationResponse(BaseModel):
    """Notification response model"""
    success: bool
    message: str
    notification_id: str
    user_id: str
    type: str
    title: str
    message: str
    read: bool
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }