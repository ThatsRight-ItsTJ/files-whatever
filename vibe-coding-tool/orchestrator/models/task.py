"""
Task models for Vibe Coding Tool
"""

from typing import Dict, Any, List, Optional, Set
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class TaskStatus(str, Enum):
    """Task execution status"""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    """Types of tasks that can be executed"""
    FILE_SEARCH = "file_search"
    CODE_ANALYSIS = "code_analysis"
    AST_PARSING = "ast_parsing"
    SECURITY_SCAN = "security_scan"
    VULNERABILITY_ANALYSIS = "vulnerability_analysis"
    REPO_MANAGEMENT = "repo_management"
    KNOWLEDGE_GRAPH_GENERATION = "kg_generation"
    AGENT_EXECUTION = "agent_execution"
    CUSTOM = "custom"

class TaskPriority(int, Enum):
    """Task priority levels"""
    LOW = 0
    NORMAL = 1
    HIGH = 2
    CRITICAL = 3

class Task(BaseModel):
    """Task model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: TaskType
    priority: TaskPriority = TaskPriority.NORMAL
    input: Dict[str, Any] = Field(default_factory=dict)
    required_capabilities: List[str] = Field(default_factory=list)
    is_heavy: bool = False
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    timeout: Optional[int] = None  # seconds
    max_retries: int = 3
    retry_count: int = 0
    error_message: Optional[str] = None
    result_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v is not None and v <= 0:
            raise ValueError('Timeout must be positive')
        if v is not None and v > 3600:  # 1 hour max
            raise ValueError('Timeout cannot exceed 1 hour')
        return v
    
    @validator('max_retries')
    def validate_max_retries(cls, v):
        """Validate max retries value"""
        if v < 0:
            raise ValueError('Max retries cannot be negative')
        if v > 10:
            raise ValueError('Max retries cannot exceed 10')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TaskCreate(BaseModel):
    """Task creation model"""
    type: TaskType
    priority: TaskPriority = TaskPriority.NORMAL
    input: Dict[str, Any] = Field(default_factory=dict)
    required_capabilities: List[str] = Field(default_factory=list)
    is_heavy: bool = False
    timeout: Optional[int] = None
    max_retries: int = 3
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v is not None and v <= 0:
            raise ValueError('Timeout must be positive')
        if v is not None and v > 3600:  # 1 hour max
            raise ValueError('Timeout cannot exceed 1 hour')
        return v
    
    @validator('max_retries')
    def validate_max_retries(cls, v):
        """Validate max retries value"""
        if v < 0:
            raise ValueError('Max retries cannot be negative')
        if v > 10:
            raise ValueError('Max retries cannot exceed 10')
        return v

class TaskUpdate(BaseModel):
    """Task update model"""
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    timeout: Optional[int] = None
    max_retries: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v is not None and v <= 0:
            raise ValueError('Timeout must be positive')
        if v is not None and v > 3600:  # 1 hour max
            raise ValueError('Timeout cannot exceed 1 hour')
        return v
    
    @validator('max_retries')
    def validate_max_retries(cls, v):
        """Validate max retries value"""
        if v is not None and v < 0:
            raise ValueError('Max retries cannot be negative')
        if v is not None and v > 10:
            raise ValueError('Max retries cannot exceed 10')
        return v

class TaskFilter(BaseModel):
    """Task filter model"""
    status: Optional[TaskStatus] = None
    type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    is_heavy: Optional[bool] = None
    user_id: Optional[str] = None
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

class TaskStats(BaseModel):
    """Task statistics model"""
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    running_tasks: int
    pending_tasks: int
    average_execution_time: float  # seconds
    success_rate: float  # percentage
    
    @validator('success_rate')
    def validate_success_rate(cls, v):
        """Validate success rate value"""
        if v < 0 or v > 100:
            raise ValueError('Success rate must be between 0 and 100')
        return v