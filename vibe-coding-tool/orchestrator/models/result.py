from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum
from datetime import datetime

class ResultType(str, Enum):
    DIRECT = "direct"
    POINTER = "pointer"

class ResultCreate(BaseModel):
    task_id: str
    user_id: str
    type: ResultType
    data: dict[str, Any]
    metadata: dict[str, Any] = {}

class Result(BaseModel):
    id: str
    task_id: str
    user_id: str
    type: ResultType
    data: dict[str, Any]
    metadata: dict[str, Any] = {}
    created_at: datetime
    pointer_id: Optional[str] = None

    class Config:
        from_attributes = True