"""
Project models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

class ProjectStatus(str, Enum):
    """Project status"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"
    TEMPLATE = "template"

class ProjectVisibility(str, Enum):
    """Project visibility"""
    PRIVATE = "private"
    PUBLIC = "public"
    UNLISTED = "unlisted"

class Project(BaseModel):
    """Project model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    user_id: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    visibility: ProjectVisibility = ProjectVisibility.PRIVATE
    repository_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate project name"""
        if len(v) < 1:
            raise ValueError('Project name cannot be empty')
        if len(v) > 100:
            raise ValueError('Project name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate project description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Project description cannot exceed 1000 characters')
        return v
    
    @validator('repository_url')
    def validate_repository_url(cls, v):
        """Validate repository URL"""
        if v is not None and not v.startswith(('http://', 'https://')):
            raise ValueError('Repository URL must start with http:// or https://')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags"""
        if len(v) > 20:
            raise ValueError('Cannot have more than 20 tags')
        for tag in v:
            if len(tag) > 50:
                raise ValueError('Tag cannot exceed 50 characters')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProjectCreate(BaseModel):
    """Project creation model"""
    name: str
    description: Optional[str] = None
    visibility: ProjectVisibility = ProjectVisibility.PRIVATE
    repository_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate project name"""
        if len(v) < 1:
            raise ValueError('Project name cannot be empty')
        if len(v) > 100:
            raise ValueError('Project name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate project description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Project description cannot exceed 1000 characters')
        return v
    
    @validator('repository_url')
    def validate_repository_url(cls, v):
        """Validate repository URL"""
        if v is not None and not v.startswith(('http://', 'https://')):
            raise ValueError('Repository URL must start with http:// or https://')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags"""
        if len(v) > 20:
            raise ValueError('Cannot have more than 20 tags')
        for tag in v:
            if len(tag) > 50:
                raise ValueError('Tag cannot exceed 50 characters')
        return v

class ProjectUpdate(BaseModel):
    """Project update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    visibility: Optional[ProjectVisibility] = None
    repository_url: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    
    @validator('name')
    def validate_name(cls, v):
        """Validate project name"""
        if v is not None:
            if len(v) < 1:
                raise ValueError('Project name cannot be empty')
            if len(v) > 100:
                raise ValueError('Project name cannot exceed 100 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        """Validate project description"""
        if v is not None and len(v) > 1000:
            raise ValueError('Project description cannot exceed 1000 characters')
        return v
    
    @validator('repository_url')
    def validate_repository_url(cls, v):
        """Validate repository URL"""
        if v is not None and not v.startswith(('http://', 'https://')):
            raise ValueError('Repository URL must start with http:// or https://')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags"""
        if v is not None:
            if len(v) > 20:
                raise ValueError('Cannot have more than 20 tags')
            for tag in v:
                if len(tag) > 50:
                    raise ValueError('Tag cannot exceed 50 characters')
        return v

class ProjectFilter(BaseModel):
    """Project filter model"""
    user_id: Optional[str] = None
    status: Optional[ProjectStatus] = None
    visibility: Optional[ProjectVisibility] = None
    tag: Optional[str] = None
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

class ProjectStats(BaseModel):
    """Project statistics model"""
    total_projects: int
    active_projects: int
    archived_projects: int
    deleted_projects: int
    template_projects: int
    public_projects: int
    private_projects: int
    unlisted_projects: int
    projects_created_today: int
    average_tasks_per_project: float
    
    @validator('average_tasks_per_project')
    def validate_average_tasks_per_project(cls, v):
        """Validate average tasks per project value"""
        if v < 0:
            raise ValueError('Average tasks per project cannot be negative')
        return v

class ProjectTemplate(BaseModel):
    """Project template model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    user_id: Optional[str] = None  # None for system templates
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_system_template: bool = False
    usage_count: int = 0
    
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
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags"""
        if len(v) > 20:
            raise ValueError('Cannot have more than 20 tags')
        for tag in v:
            if len(tag) > 50:
                raise ValueError('Tag cannot exceed 50 characters')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProjectTemplateCreate(BaseModel):
    """Project template creation model"""
    name: str
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_system_template: bool = False
    
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
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags"""
        if len(v) > 20:
            raise ValueError('Cannot have more than 20 tags')
        for tag in v:
            if len(tag) > 50:
                raise ValueError('Tag cannot exceed 50 characters')
        return v

class ProjectMember(BaseModel):
    """Project member model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    user_id: str
    role: str = "member"  # member, admin, owner
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    permissions: Dict[str, bool] = Field(default_factory=dict)
    
    @validator('role')
    def validate_role(cls, v):
        """Validate role value"""
        valid_roles = ['member', 'admin', 'owner']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of: {valid_roles}')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }