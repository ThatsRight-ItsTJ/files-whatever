from pydantic import BaseModel
from typing import List, Optional, Any
from enum import Enum
from datetime import datetime

from .mcp import Capability

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    CODE_GENERATION = "code-generation"
    FILE_SEARCH = "file-search"
    SECURITY_SCAN = "security-scan"
    # Add more as needed

class TaskCreate(BaseModel):
    type: TaskType
    priority: int = 0
    input: dict[str, Any]
    required_capabilities: Optional[List[Capability]] = None
    is_heavy: bool = False

class Task(BaseModel):
    id: str
    user_id: str
    type: TaskType
    priority: int = 0
    input: dict[str, Any]
    required_capabilities: Optional[List[Capability]] = None
    is_heavy: bool = False
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime

    class Config:
        from_attributes = True