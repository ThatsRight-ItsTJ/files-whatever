from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Job(BaseModel):
    id: str
    task_id: str
    user_id: str
    mcp_id: str
    mcp_url: str
    status: JobStatus = JobStatus.QUEUED
    created_at: datetime
    priority: int = 0
    timeout: int = 300
    retry_count: int = 0
    max_retries: int = 3
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    last_error_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    task_id: str
    mcp_id: str
    user_id: str
    timeout: Optional[int] = 300
    priority: int = 0
    max_retries: int = 3