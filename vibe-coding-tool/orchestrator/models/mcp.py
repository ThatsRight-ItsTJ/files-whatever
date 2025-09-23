from pydantic import BaseModel
from typing import List, Set, Optional
from enum import Enum
from datetime import datetime

class MCPStatus(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

class Capability(BaseModel):
    name: str
    version: str
    parameters: Set[str]

class RoutingFlags(BaseModel):
    can_run_on_user_space: bool = False
    result_pointer_preferred: bool = False
    fallback_to_oracle: bool = True

class MCPInfo(BaseModel):
    id: str
    name: str
    url: str
    capabilities: List[Capability]
    supported_task_types: List[str]
    routing_flags: RoutingFlags
    status: MCPStatus = MCPStatus.UNKNOWN
    last_health_check: Optional[datetime] = None

    class Config:
        from_attributes = True