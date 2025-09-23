"""
Agent models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class AgentType(str, Enum):
    """Agent types"""
    CODE_GENERATOR = "code_generator"
    CODE_ANALYZER = "code_analyzer"
    SECURITY_SCANNER = "security_scanner"
    DOCUMENTATION_GENERATOR = "documentation_generator"
    TEST_GENERATOR = "test_generator"
    CUSTOM = "custom"

class AgentStatus(str, Enum):
    """Agent status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    ARCHIVED = "archived"

class Agent(BaseModel):
    """Agent model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    user_id: str
    type: AgentType
    status: AgentStatus = AgentStatus.ACTIVE
    version: str = "1.0.0"
    template_id: Optional[str] = None
    prompt_template: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    capabilities: List[str] = Field(default_factory=list)
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    usage_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate agent name"""
        if len(v) < 1:
            raise ValueError('Agent name cannot be empty')
        if len(v) > 100:
            raise ValueError('Agent name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate agent description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Agent description cannot exceed 1000 characters')
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities"""
        for capability in v:
            if not isinstance(capability, str):
                raise ValueError('Capabilities must be strings')
        return v
    
    @validator('examples')
    def validate_examples(cls, v):
        """Validate examples"""
        for example in v:
            if not isinstance(example, dict):
                raise ValueError('Examples must be dictionaries')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AgentCreate(BaseModel):
    """Agent creation model"""
    name: str
    description: Optional[str] = None
    type: AgentType
    version: str = "1.0.0"
    template_id: Optional[str] = None
    prompt_template: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    capabilities: List[str] = Field(default_factory=list)
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate agent name"""
        if len(v) < 1:
            raise ValueError('Agent name cannot be empty')
        if len(v) > 100:
            raise ValueError('Agent name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate agent description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Agent description cannot exceed 1000 characters')
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities"""
        for capability in v:
            if not isinstance(capability, str):
                raise ValueError('Capabilities must be strings')
        return v
    
    @validator('examples')
    def validate_examples(cls, v):
        """Validate examples"""
        for example in v:
            if not isinstance(example, dict):
                raise ValueError('Examples must be dictionaries')
        return v

class AgentUpdate(BaseModel):
    """Agent update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[AgentType] = None
    status: Optional[AgentStatus] = None
    version: Optional[str] = None
    template_id: Optional[str] = None
    prompt_template: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    capabilities: Optional[List[str]] = None
    examples: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('name')
    def validate_name(cls, v):
        """Validate agent name"""
        if v is not None:
            if len(v) < 1:
                raise ValueError('Agent name cannot be empty')
            if len(v) > 100:
                raise ValueError('Agent name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate agent description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Agent description cannot exceed 1000 characters')
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if v is not None and not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities"""
        if v is not None:
            for capability in v:
                if not isinstance(capability, str):
                    raise ValueError('Capabilities must be strings')
        return v
    
    @validator('examples')
    def validate_examples(cls, v):
        """Validate examples"""
        if v is not None:
            for example in v:
                if not isinstance(example, dict):
                    raise ValueError('Examples must be dictionaries')
        return v

class AgentFilter(BaseModel):
    """Agent filter model"""
    user_id: Optional[str] = None
    type: Optional[AgentType] = None
    status: Optional[AgentStatus] = None
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

class AgentStats(BaseModel):
    """Agent statistics model"""
    total_agents: int
    active_agents: int
    inactive_agents: int
    draft_agents: int
    archived_agents: int
    code_generator_agents: int
    code_analyzer_agents: int
    security_scanner_agents: int
    documentation_generator_agents: int
    test_generator_agents: int
    custom_agents: int
    agents_created_today: int
    average_usage_per_agent: float
    
    @validator('average_usage_per_agent')
    def validate_average_usage_per_agent(cls, v):
        """Validate average usage per agent value"""
        if v < 0:
            raise ValueError('Average usage per agent cannot be negative')
        return v

class AgentTemplate(BaseModel):
    """Agent template model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    type: AgentType
    version: str = "1.0.0"
    prompt_template: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    capabilities: List[str] = Field(default_factory=list)
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    is_system_template: bool = False
    usage_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate template name"""
        if len(v) < 1:
            raise ValueError('Template name cannot be empty')
        if len(v) > 100:
            raise ValueError('Template name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate template description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Template description cannot exceed 1000 characters')
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('prompt_template')
    def validate_prompt_template(cls, v):
        """Validate prompt template"""
        if not v:
            raise ValueError('Prompt template cannot be empty')
        if len(v) > 10000:
            raise ValueError('Prompt template cannot exceed 10000 characters')
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities"""
        for capability in v:
            if not isinstance(capability, str):
                raise ValueError('Capabilities must be strings')
        return v
    
    @validator('examples')
    def validate_examples(cls, v):
        """Validate examples"""
        for example in v:
            if not isinstance(example, dict):
                raise ValueError('Examples must be dictionaries')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AgentTemplateCreate(BaseModel):
    """Agent template creation model"""
    name: str
    description: Optional[str] = None
    type: AgentType
    version: str = "1.0.0"
    prompt_template: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    capabilities: List[str] = Field(default_factory=list)
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    is_system_template: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate template name"""
        if len(v) < 1:
            raise ValueError('Template name cannot be empty')
        if len(v) > 100:
            raise ValueError('Template name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate template description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Template description cannot exceed 1000 characters')
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version format"""
        if not v.replace('.', '').isdigit():
            raise ValueError('Version must be in format X.Y.Z')
        return v
    
    @validator('prompt_template')
    def validate_prompt_template(cls, v):
        """Validate prompt template"""
        if not v:
            raise ValueError('Prompt template cannot be empty')
        if len(v) > 10000:
            raise ValueError('Prompt template cannot exceed 10000 characters')
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities"""
        for capability in v:
            if not isinstance(capability, str):
                raise ValueError('Capabilities must be strings')
        return v
    
    @validator('examples')
    def validate_examples(cls, v):
        """Validate examples"""
        for example in v:
            if not isinstance(example, dict):
                raise ValueError('Examples must be dictionaries')
        return v

class AgentExecution(BaseModel):
    """Agent execution model"""
    agent_id: str
    user_id: str
    project_id: Optional[str] = None
    input_data: Dict[str, Any] = Field(default_factory=dict)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    timeout: int = 300  # seconds
    max_retries: int = 3
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