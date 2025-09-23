"""
Main FastAPI application for Vibe Coding Tool MetaMCP Orchestrator
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer

from api import tasks, projects, mcps, auth, health, kg, agents
from core.auth_service import AuthService
from core.registry import MCPRegistry
from core.job_manager import JobManager
from core.result_manager import ResultManager
from config.settings import settings
from middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from utils.metrics import MetricsCollector

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format=settings.log_format
)
logger = logging.getLogger(__name__)

# Initialize security
security = HTTPBearer()

# Initialize services
auth_service = AuthService()
registry = MCPRegistry()
job_manager = JobManager()
result_manager = ResultManager()
metrics_collector = MetricsCollector()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Vibe Coding Tool MetaMCP Orchestrator")
    
    # Initialize database connections
    # TODO: Initialize database connections
    
    # Initialize Redis connections
    # TODO: Initialize Redis connections
    
    # Register default MCPs
    await registry.register_default_mcps()
    
    # Start background tasks
    # TODO: Start background tasks for health checks, etc.
    
    # Store services in app state
    app.state.auth_service = auth_service
    app.state.registry = registry
    app.state.job_manager = job_manager
    app.state.result_manager = result_manager
    app.state.metrics_collector = metrics_collector
    
    logger.info("Vibe Coding Tool MetaMCP Orchestrator started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Vibe Coding Tool MetaMCP Orchestrator")
    
    # Close database connections
    # TODO: Close database connections
    
    # Close Redis connections
    # TODO: Close Redis connections
    
    # Stop background tasks
    # TODO: Stop background tasks
    
    logger.info("Vibe Coding Tool MetaMCP Orchestrator shut down successfully")

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Orchestrator for MCP-based AI coding assistance",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(ValueError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(mcps.router, prefix="/api", tags=["mcps"])
app.include_router(kg.router, prefix="/api", tags=["kg"])
app.include_router(agents.router, prefix="/api", tags=["agents"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Vibe Coding Tool - MetaMCP Orchestrator",
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version
    }

@app.get("/metrics")
async def get_metrics():
    """Get application metrics"""
    return await metrics_collector.get_metrics()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log HTTP requests"""
    start_time = datetime.utcnow()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url} - "
        f"Status: {response.status_code} - "
        f"Time: {processing_time:.3f}s"
    )
    
    # Collect metrics
    await metrics_collector.record_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        processing_time=processing_time
    )
    
    return response

@app.middleware("http")
async def rate_limiting(request: Request, call_next):
    """Rate limiting middleware"""
    # TODO: Implement rate limiting
    # For now, just pass through
    return await call_next(request)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers"""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )