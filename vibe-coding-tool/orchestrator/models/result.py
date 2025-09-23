"""
Result models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class ResultStatus(str, Enum):
    """Result status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ResultType(str, Enum):
    """Types of results"""
    DIRECT = "direct"
    POINTER = "pointer"
    STREAM = "stream"
    ERROR = "error"

class Result(BaseModel):
    """Result model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    type: ResultType
    data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    pointer_id: Optional[str] = None
    size: Optional[int] = None  # bytes
    checksum: Optional[str] = None  # MD5 hash
    
    @validator('size')
    def validate_size(cls, v):
        """Validate size value"""
        if v is not None and v < 0:
            raise ValueError('Size cannot be negative')
        if v is not None and v > 1024 * 1024 * 1024:  # 1GB max
            raise ValueError('Size cannot exceed 1GB')
        return v
    
    @validator('checksum')
    def validate_checksum(cls, v):
        """Validate checksum format"""
        if v is not None and len(v) != 32:  # MD5 hash length
            raise ValueError('Checksum must be a valid MD5 hash')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ResultCreate(BaseModel):
    """Result creation model"""
    task_id: str
    user_id: str
    type: ResultType
    data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    pointer_id: Optional[str] = None
    size: Optional[int] = None
    checksum: Optional[str] = None
    
    @validator('size')
    def validate_size(cls, v):
        """Validate size value"""
        if v is not None and v < 0:
            raise ValueError('Size cannot be negative')
        if v is not None and v > 1024 * 1024 * 1024:  # 1GB max
            raise ValueError('Size cannot exceed 1GB')
        return v
    
    @validator('checksum')
    def validate_checksum(cls, v):
        """Validate checksum format"""
        if v is not None and len(v) != 32:  # MD5 hash length
            raise ValueError('Checksum must be a valid MD5 hash')
        return v

class ResultUpdate(BaseModel):
    """Result update model"""
    data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    pointer_id: Optional[str] = None
    size: Optional[int] = None
    checksum: Optional[str] = None
    
    @validator('size')
    def validate_size(cls, v):
        """Validate size value"""
        if v is not None and v < 0:
            raise ValueError('Size cannot be negative')
        if v is not None and v > 1024 * 1024 * 1024:  # 1GB max
            raise ValueError('Size cannot exceed 1GB')
        return v
    
    @validator('checksum')
    def validate_checksum(cls, v):
        """Validate checksum format"""
        if v is not None and len(v) != 32:  # MD5 hash length
            raise ValueError('Checksum must be a valid MD5 hash')
        return v

class ResultFilter(BaseModel):
    """Result filter model"""
    task_id: Optional[str] = None
    user_id: Optional[str] = None
    type: Optional[ResultType] = None
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

class ResultStats(BaseModel):
    """Result statistics model"""
    total_results: int
    direct_results: int
    pointer_results: int
    stream_results: int
    error_results: int
    total_size: int  # bytes
    average_size: float  # bytes
    results_created_today: int
    
    @validator('total_size')
    def validate_total_size(cls, v):
        """Validate total size value"""
        if v < 0:
            raise ValueError('Total size cannot be negative')
        return v
    
    @validator('average_size')
    def validate_average_size(cls, v):
        """Validate average size value"""
        if v < 0:
            raise ValueError('Average size cannot be negative')
        return v

class ResultPointer(BaseModel):
    """Result pointer model"""
    result_id: str
    pointer_id: str
    user_id: str
    task_id: str
    type: ResultType
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """Validate expiration time"""
        if v is not None and v <= datetime.utcnow():
            raise ValueError('Expiration time must be in the future')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }