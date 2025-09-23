"""
Settings configuration for Vibe Coding Tool
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings"""
    
    # Application settings
    app_name: str = "Vibe Coding Tool - MetaMCP Orchestrator"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"
    secret_key: str = Field(default_factory=lambda: os.urandom(32).hex())
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # CORS settings
    allowed_origins: List[str] = Field(default_factory=lambda: [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8000"
    ])
    
    # Database settings
    database_url: str = Field(default_factory=lambda: os.getenv(
        "DATABASE_URL", 
        "postgresql://user:password@localhost:5432/vibe_coding_tool"
    ))
    database_pool_size: int = 20
    database_max_overflow: int = 30
    database_pool_timeout: int = 30
    
    # Redis settings
    redis_url: str = Field(default_factory=lambda: os.getenv(
        "REDIS_URL", 
        "redis://localhost:6379/0"
    ))
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_socket_timeout: int = 5
    redis_socket_connect_timeout: int = 5
    
    # JWT settings
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_secret_key: str = Field(default_factory=lambda: os.getenv(
        "JWT_SECRET_KEY", 
        os.urandom(32).hex()
    ))
    
    # GitHub OAuth settings
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    github_callback_url: str = Field(default_factory=lambda: os.getenv(
        "GITHUB_CALLBACK_URL", 
        "http://localhost:8000/api/auth/github/callback"
    ))
    
    # HuggingFace OAuth settings
    hf_client_id: Optional[str] = None
    hf_client_secret: Optional[str] = None
    hf_callback_url: str = Field(default_factory=lambda: os.getenv(
        "HF_CALLBACK_URL", 
        "http://localhost:8000/api/auth/huggingface/callback"
    ))
    
    # MCP settings
    mcp_registry_url: str = "http://localhost:8080"
    mcp_health_check_interval: int = 60  # seconds
    mcp_max_concurrent_requests: int = 100
    mcp_request_timeout: int = 30  # seconds
    mcp_retry_attempts: int = 3
    mcp_retry_delay: int = 1  # seconds
    
    # Task settings
    task_queue_name: str = "vibe_tasks"
    task_max_retries: int = 3
    task_retry_delay: int = 5  # seconds
    task_timeout: int = 3600  # 1 hour
    task_cleanup_interval: int = 3600  # 1 hour
    
    # Job settings
    job_queue_name: str = "vibe_jobs"
    job_max_retries: int = 3
    job_retry_delay: int = 5  # seconds
    job_timeout: int = 1800  # 30 minutes
    job_cleanup_interval: int = 3600  # 1 hour
    
    # Result settings
    result_storage_backend: str = "database"  # database, s3, gcs
    result_cleanup_interval: int = 86400  # 24 hours
    result_retention_days: int = 30
    result_max_size: int = 1024 * 1024 * 1024  # 1GB
    
    # Rate limiting
    rate_limit_requests_per_minute: int = 100
    rate_limit_requests_per_hour: int = 1000
    rate_limit_requests_per_day: int = 10000
    
    # Security settings
    enable_cors: bool = True
    enable_rate_limiting: bool = True
    enable_authentication: bool = True
    enable_audit_logging: bool = True
    password_min_length: int = 8
    password_max_length: int = 64
    session_timeout: int = 3600  # 1 hour
    
    # Monitoring settings
    enable_metrics: bool = True
    metrics_port: int = 8001
    metrics_path: str = "/metrics"
    enable_health_checks: bool = True
    health_check_path: str = "/health"
    
    # File upload settings
    upload_max_file_size: int = 100 * 1024 * 1024  # 100MB
    upload_allowed_extensions: List[str] = Field(default_factory=lambda: [
        ".py", ".js", ".ts", ".jsx", ".tsx", ".json", ".md", ".txt",
        ".yml", ".yaml", ".xml", ".html", ".css", ".scss", ".less",
        ".sql", ".sh", ".bat", ".ps1", ".dockerfile", ".gitignore"
    ])
    upload_temp_dir: str = "/tmp/vibe_uploads"
    
    # Knowledge graph settings
    kg_storage_backend: str = "database"  # database, neo4j, arango
    kg_cleanup_interval: int = 3600  # 1 hour
    kg_retention_days: int = 90
    
    # Agent settings
    agent_max_concurrent_executions: int = 10
    agent_timeout: int = 1800  # 30 minutes
    agent_max_retries: int = 3
    agent_retry_delay: int = 5  # seconds
    
    # Webhook settings
    webhook_max_retries: int = 3
    webhook_retry_delay: int = 5  # seconds
    webhook_timeout: int = 30  # seconds
    webhook_secret: Optional[str] = None
    
    # Notification settings
    notification_enabled: bool = True
    notification_email_enabled: bool = False
    notification_push_enabled: bool = False
    notification_sms_enabled: bool = False
    
    # Email settings
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    smtp_from_email: Optional[str] = None
    
    # Push notification settings
    push_notification_service: Optional[str] = None  # fcm, apns, webpush
    push_notification_api_key: Optional[str] = None
    push_notification_auth_key: Optional[str] = None
    
    # SMS notification settings
    sms_provider: Optional[str] = None  # twilio, aws_sns
    sms_api_key: Optional[str] = None
    sms_api_secret: Optional[str] = None
    sms_from_number: Optional[str] = None
    
    # Cloud storage settings
    cloud_storage_provider: Optional[str] = None  # aws_s3, google_gcs, azure_blob
    cloud_storage_bucket: Optional[str] = None
    cloud_storage_region: Optional[str] = None
    cloud_storage_access_key: Optional[str] = None
    cloud_storage_secret_key: Optional[str] = None
    
    # Monitoring and logging
    log_file_path: Optional[str] = None
    log_rotation_max_size: int = 10 * 1024 * 1024  # 10MB
    log_rotation_backup_count: int = 5
    log_level_file: str = "INFO"
    log_level_console: str = "INFO"
    
    # Performance settings
    enable_caching: bool = True
    cache_ttl: int = 3600  # 1 hour
    cache_max_size: int = 1000
    enable_compression: bool = True
    enable_gzip: bool = True
    
    # Development settings
    enable_debug_toolbar: bool = False
    enable_sql_debug: bool = False
    enable_redis_debug: bool = False
    enable_mcp_debug: bool = False
    
    @validator('log_level')
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.upper()
    
    @validator('environment')
    def validate_environment(cls, v):
        """Validate environment"""
        valid_environments = ['development', 'staging', 'production']
        if v not in valid_environments:
            raise ValueError(f'Environment must be one of: {valid_environments}')
        return v
    
    @validator('database_url')
    def validate_database_url(cls, v):
        """Validate database URL"""
        if not v.startswith(('postgresql://', 'postgres://')):
            raise ValueError('Database URL must start with postgresql:// or postgres://')
        return v
    
    @validator('redis_url')
    def validate_redis_url(cls, v):
        """Validate Redis URL"""
        if not v.startswith(('redis://', 'rediss://')):
            raise ValueError('Redis URL must start with redis:// or rediss://')
        return v
    
    @validator('upload_allowed_extensions')
    def validate_upload_extensions(cls, v):
        """Validate upload extensions"""
        for ext in v:
            if not ext.startswith('.'):
                raise ValueError('Upload extensions must start with .')
        return v
    
    @validator('cloud_storage_provider')
    def validate_cloud_storage_provider(cls, v):
        """Validate cloud storage provider"""
        if v is not None:
            valid_providers = ['aws_s3', 'google_gcs', 'azure_blob']
            if v not in valid_providers:
                raise ValueError(f'Cloud storage provider must be one of: {valid_providers}')
        return v
    
    @validator('push_notification_service')
    def validate_push_notification_service(cls, v):
        """Validate push notification service"""
        if v is not None:
            valid_services = ['fcm', 'apns', 'webpush']
            if v not in valid_services:
                raise ValueError(f'Push notification service must be one of: {valid_services}')
        return v
    
    @validator('sms_provider')
    def validate_sms_provider(cls, v):
        """Validate SMS provider"""
        if v is not None:
            valid_providers = ['twilio', 'aws_sns']
            if v not in valid_providers:
                raise ValueError(f'SMS provider must be one of: {valid_providers}')
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        env_prefix = "VIBE_"
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure temp directory exists
        if self.upload_temp_dir and not os.path.exists(self.upload_temp_dir):
            os.makedirs(self.upload_temp_dir, exist_ok=True)


# Global settings instance
settings = Settings()