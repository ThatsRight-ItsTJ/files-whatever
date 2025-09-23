"""
User models for Vibe Coding Tool
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator, EmailStr
import uuid

class UserRole(str, Enum):
    """User roles"""
    USER = "user"
    ADMIN = "admin"
    DEVELOPER = "developer"

class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class OAuthProvider(str, Enum):
    """OAuth providers"""
    GITHUB = "github"
    HUGGINGFACE = "huggingface"

class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format"""
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username cannot exceed 50 characters')
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username can only contain alphanumeric characters and underscores')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        """Validate role value"""
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

class UserCreate(BaseModel):
    """User creation model"""
    username: str
    email: EmailStr
    role: UserRole = UserRole.USER
    preferences: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format"""
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username cannot exceed 50 characters')
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username can only contain alphanumeric characters and underscores')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        """Validate role value"""
        return v

class UserUpdate(BaseModel):
    """User update model"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    preferences: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format"""
        if v is not None:
            if len(v) < 3:
                raise ValueError('Username must be at least 3 characters long')
            if len(v) > 50:
                raise ValueError('Username cannot exceed 50 characters')
            if not v.isalnum() and '_' not in v:
                raise ValueError('Username can only contain alphanumeric characters and underscores')
        return v

class UserFilter(BaseModel):
    """User filter model"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
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

class OAuthAccount(BaseModel):
    """OAuth account model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    provider: OAuthProvider
    provider_user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    scope: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """Validate expiration time"""
        if v is not None and v <= datetime.utcnow():
            raise ValueError('Expiration time must be in the future')
        return v
    
    @validator('scope')
    def validate_scope(cls, v):
        """Validate scope format"""
        for scope_item in v:
            if not isinstance(scope_item, str):
                raise ValueError('Scope items must be strings')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class OAuthAccountCreate(BaseModel):
    """OAuth account creation model"""
    user_id: str
    provider: OAuthProvider
    provider_user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    scope: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """Validate expiration time"""
        if v is not None and v <= datetime.utcnow():
            raise ValueError('Expiration time must be in the future')
        return v
    
    @validator('scope')
    def validate_scope(cls, v):
        """Validate scope format"""
        for scope_item in v:
            if not isinstance(scope_item, str):
                raise ValueError('Scope items must be strings')
        return v

class OAuthAccountUpdate(BaseModel):
    """OAuth account update model"""
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    scope: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """Validate expiration time"""
        if v is not None and v <= datetime.utcnow():
            raise ValueError('Expiration time must be in the future')
        return v
    
    @validator('scope')
    def validate_scope(cls, v):
        """Validate scope format"""
        if v is not None:
            for scope_item in v:
                if not isinstance(scope_item, str):
                    raise ValueError('Scope items must be strings')
        return v

class UserStats(BaseModel):
    """User statistics model"""
    total_users: int
    active_users: int
    inactive_users: int
    suspended_users: int
    pending_users: int
    admin_users: int
    developer_users: int
    users_created_today: int
    average_tasks_per_user: float
    
    @validator('average_tasks_per_user')
    def validate_average_tasks_per_user(cls, v):
        """Validate average tasks per user value"""
        if v < 0:
            raise ValueError('Average tasks per user cannot be negative')
        return v

class UserPreferences(BaseModel):
    """User preferences model"""
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"
    notifications: Dict[str, bool] = Field(default_factory=dict)
    editor: Dict[str, Any] = Field(default_factory=dict)
    mcp_preferences: Dict[str, Any] = Field(default_factory=dict)
    privacy_settings: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('theme')
    def validate_theme(cls, v):
        """Validate theme value"""
        valid_themes = ['light', 'dark', 'system']
        if v not in valid_themes:
            raise ValueError(f'Theme must be one of: {valid_themes}')
        return v
    
    @validator('language')
    def validate_language(cls, v):
        """Validate language code"""
        if len(v) != 2:
            raise ValueError('Language code must be 2 characters')
        return v
    
    @validator('timezone')
    def validate_timezone(cls, v):
        """Validate timezone"""
        # Basic validation - in production, use a proper timezone library
        if not v:
            raise ValueError('Timezone cannot be empty')
        return v