"""
MCP (Model Context Protocol) models for Vibe Coding Tool
"""

from typing import List, Dict, Any, Optional, Set
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class MCPStatus(str, Enum):
    """MCP server status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"
    OFFLINE = "offline"

class RoutingFlags(BaseModel):
    """Routing configuration flags"""
    can_run_on_user_space: bool = False
    result_pointer_preferred: bool = False
    fallback_to_oracle: bool = True
    priority: int = 1
    max_concurrent_jobs: int = 5
    timeout: int = 300  # seconds
    
    @validator('priority')
    def validate_priority(cls, v):
        """Validate priority value"""
        if v < 0:
            raise ValueError('Priority cannot be negative')
        if v > 10:
            raise ValueError('Priority cannot exceed 10')
        return v
    
    @validator('max_concurrent_jobs')
    def validate_max_concurrent_jobs(cls, v):
        """Validate max concurrent jobs value"""
        if v < 1:
            raise ValueError('Max concurrent jobs must be at least 1')
        if v > 100:
            raise ValueError('Max concurrent jobs cannot exceed 100')
        return v
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v <= 0:
            raise ValueError('Timeout must be positive')
        if v > 3600:  # 1 hour max
            raise ValueError('Timeout cannot exceed 1 hour')
        return v

class Capability(BaseModel):
    """MCP capability definition"""
    name: str
    version: str = "1.0.0"
    parameters: Set[str] = Field(default_factory=set)
    description: Optional[str] = None
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('parameters')
    def validate_parameters(cls, v):
        """Validate parameters format"""
        for param in v:
            if not param.isidentifier():
                raise ValueError('Parameter names must be valid identifiers')
        return v

class MCPInfo(BaseModel):
    """MCP server information"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    url: str
    description: Optional[str] = None
    version: str = "1.0.0"
    author: Optional[str] = None
    capabilities: List[Capability] = Field(default_factory=list)
    supported_task_types: List[str] = Field(default_factory=list)
    routing_flags: RoutingFlags = Field(default_factory=RoutingFlags)
    status: MCPStatus = MCPStatus.UNKNOWN
    last_health_check: Optional[datetime] = None
    last_error: Optional[str] = None
    error_count: int = 0
    total_jobs_processed: int = 0
    successful_jobs: int = 0
    failed_jobs: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL format"""
        if not v.startswith(('http://', 'https://', 'hf://')):
            raise ValueError('URL must start with http://, https://, or hf://')
        return v
    
    @validator('supported_task_types')
    def validate_supported_task_types(cls, v):
        """Validate supported task types"""
        valid_types = [
            'file_search', 'code_analysis', 'ast_parsing', 'security_scan',
            'vulnerability_analysis', 'repo_management', 'kg_generation',
            'agent_execution', 'custom'
        ]
        for task_type in v:
            if task_type not in valid_types:
                raise ValueError(f'Invalid task type: {task_type}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        """Validate status value"""
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MCPHealth(BaseModel):
    """MCP health check result"""
    mcp_id: str
    status: MCPStatus
    response_time: float  # milliseconds
    error_message: Optional[str] = None
    checks: Dict[str, bool] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('response_time')
    def validate_response_time(cls, v):
        """Validate response time value"""
        if v < 0:
            raise ValueError('Response time cannot be negative')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MCPCreate(BaseModel):
    """MCP creation request"""
    name: str
    url: str
    description: Optional[str] = None
    version: str = "1.0.0"
    author: Optional[str] = None
    capabilities: List[Capability] = Field(default_factory=list)
    supported_task_types: List[str] = Field(default_factory=list)
    routing_flags: Optional[RoutingFlags] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MCPRegistration(BaseModel):
    """MCP registration request"""
    name: str
    url: str
    description: Optional[str] = None
    version: str = "1.0.0"
    author: Optional[str] = None
    capabilities: List[Capability] = Field(default_factory=list)
    supported_task_types: List[str] = Field(default_factory=list)
    routing_flags: Optional[RoutingFlags] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL format"""
        if not v.startswith(('http://', 'https://', 'hf://')):
            raise ValueError('URL must start with http://, https://, or hf://')
        return v
    
    @validator('supported_task_types')
    def validate_supported_task_types(cls, v):
        """Validate supported task types"""
        valid_types = [
            'file_search', 'code_analysis', 'ast_parsing', 'security_scan',
            'vulnerability_analysis', 'repo_management', 'kg_generation',
            'agent_execution', 'custom'
        ]
        for task_type in v:
            if task_type not in valid_types:
                raise ValueError(f'Invalid task type: {task_type}')
        return v

class MCPUpdate(BaseModel):
    """MCP update request"""
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    author: Optional[str] = None
    capabilities: Optional[List[Capability]] = None
    supported_task_types: Optional[List[str]] = None
    routing_flags: Optional[RoutingFlags] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('supported_task_types')
    def validate_supported_task_types(cls, v):
        """Validate supported task types"""
        if v is None:
            return v
        valid_types = [
            'file_search', 'code_analysis', 'ast_parsing', 'security_scan',
            'vulnerability_analysis', 'repo_management', 'kg_generation',
            'agent_execution', 'custom'
        ]
        for task_type in v:
            if task_type not in valid_types:
                raise ValueError(f'Invalid task type: {task_type}')
        return v

class MCPFilter(BaseModel):
    """MCP filter model"""
    status: Optional[MCPStatus] = None
    name: Optional[str] = None
    author: Optional[str] = None
    supported_task_type: Optional[str] = None
    can_run_on_user_space: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    limit: int = 50
    offset: int = 0
    
    @validator('limit')
    def validate_limit(cls, v):
        """Validate limit value"""
        if v <= 0:
            raise ValueError('Limit must be positive')
        if v > 1000:
            raise ValueError('Limit cannot exceed 1000')
        return v
    
    @validator('offset')
    def validate_offset(cls, v):
        """Validate offset value"""
        if v < 0:
            raise ValueError('Offset cannot be negative')
        if v > 10000:
            raise ValueError('Offset cannot exceed 10000')
        return v

class MCPStats(BaseModel):
    """MCP statistics model"""
    total_mcps: int
    healthy_mcps: int
    warning_mcps: int
    unhealthy_mcps: int
    unknown_mcps: int
    offline_mcps: int
    total_jobs_processed: int
    successful_jobs: int
    failed_jobs: int
    average_response_time: float  # milliseconds
    success_rate: float  # percentage
    
    @validator('success_rate')
    def validate_success_rate(cls, v):
        """Validate success rate value"""
        if v < 0 or v > 100:
            raise ValueError('Success rate must be between 0 and 100')
        return v