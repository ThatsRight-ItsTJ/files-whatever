from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application settings
    app_name: str = Field(default="Vibe Coding Tool - MetaMCP Orchestrator", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Database settings
    database_url: str = Field(env="DATABASE_URL")
    database_pool_size: int = Field(default=20, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")
    
    # Redis settings
    redis_url: str = Field(env="REDIS_URL")
    redis_max_connections: int = Field(default=100, env="REDIS_MAX_CONNECTIONS")
    
    # JWT settings
    jwt_secret: str = Field(env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_refresh_token_expire_days: int = Field(default=7, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
    # GitHub OAuth settings
    github_client_id: str = Field(env="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(env="GITHUB_CLIENT_SECRET")
    github_redirect_uri: str = Field(default="http://localhost:3000/auth/github/callback", env="GITHUB_REDIRECT_URI")
    
    # HuggingFace OAuth settings
    hf_client_id: str = Field(env="HF_CLIENT_ID")
    hf_client_secret: str = Field(env="HF_CLIENT_SECRET")
    hf_redirect_uri: str = Field(default="http://localhost:3000/auth/huggingface/callback", env="HF_REDIRECT_URI")
    
    # Cloudflare settings
    cloudflare_api_token: Optional[str] = Field(default=None, env="CLOUDFLARE_API_TOKEN")
    cloudflare_zone_id: Optional[str] = Field(default=None, env="CLOUDFLARE_ZONE_ID")
    
    # Security settings
    secret_key: str = Field(env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS settings
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_ORIGINS"
    )
    
    # Rate limiting settings
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # Task settings
    max_concurrent_jobs: int = Field(default=10, env="MAX_CONCURRENT_JOBS")
    default_task_timeout: int = Field(default=300, env="DEFAULT_TASK_TIMEOUT")
    max_task_retries: int = Field(default=3, env="MAX_TASK_RETRIES")
    
    # Logging settings
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT")
    
    # Monitoring settings
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=8090, env="METRICS_PORT")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()