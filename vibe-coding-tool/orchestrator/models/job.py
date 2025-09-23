"""
Job models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class JobPriority(str, Enum):
    """Job priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class JobStatus(str, Enum):
    """Job execution status"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"

class Job(BaseModel):
    """Job model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    mcp_id: str
    mcp_url: str
    status: JobStatus = JobStatus.QUEUED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    priority: int = 1
    timeout: int = 300  # 5 minutes default
    retry_count: int = 0
    max_retries: int = 3
    error_message: Optional[str] = None
    result_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v <= 0:
            raise ValueError('Timeout must be positive')
        if v > 3600:  # 1 hour max
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
    
    @validator('priority')
    def validate_priority(cls, v):
        """Validate priority value"""
        if v < 0:
            raise ValueError('Priority cannot be negative')
        if v > 10:
            raise ValueError('Priority cannot exceed 10')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class JobCreate(BaseModel):
    """Job creation model"""
    task_id: str
    user_id: str
    mcp_id: str
    mcp_url: str
    priority: int = 1
    timeout: int = 300
    max_retries: int = 3
    payload: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('timeout')
    def validate_timeout(cls, v):
        """Validate timeout value"""
        if v <= 0:
            raise ValueError('Timeout must be positive')
        if v > 3600:  # 1 hour max
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
    
    @validator('priority')
    def validate_priority(cls, v):
        """Validate priority value"""
        if v < 0:
            raise ValueError('Priority cannot be negative')
        if v > 10:
            raise ValueError('Priority cannot exceed 10')
        return v

class JobUpdate(BaseModel):
    """Job update model"""
    status: Optional[JobStatus] = None
    priority: Optional[int] = None
    timeout: Optional[int] = None
    max_retries: Optional[int] = None
    error_message: Optional[str] = None
    result_id: Optional[str] = None
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
    
    @validator('priority')
    def validate_priority(cls, v):
        """Validate priority value"""
        if v is not None and v < 0:
            raise ValueError('Priority cannot be negative')
        if v is not None and v > 10:
            raise ValueError('Priority cannot exceed 10')
        return v

class JobFilter(BaseModel):
    """Job filter model"""
    status: Optional[JobStatus] = None
    user_id: Optional[str] = None
    mcp_id: Optional[str] = None
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

class JobStats(BaseModel):
    """Job statistics model"""
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    running_jobs: int
    queued_jobs: int
    average_execution_time: float  # seconds
    success_rate: float  # percentage
    retry_rate: float  # percentage
    
    @validator('success_rate')
    def validate_success_rate(cls, v):
        """Validate success rate value"""
        if v < 0 or v > 100:
            raise ValueError('Success rate must be between 0 and 100')
        return v
    
    @validator('retry_rate')
    def validate_retry_rate(cls, v):
        """Validate retry rate value"""
        if v < 0 or v > 100:
            raise ValueError('Retry rate must be between 0 and 100')
        return v