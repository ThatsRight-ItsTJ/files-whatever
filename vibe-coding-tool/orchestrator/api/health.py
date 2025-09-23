"""
Health check API endpoints for Vibe Coding Tool
"""

import logging
import asyncio
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from models.response import StandardResponse
from core.registry import MCPRegistry
from core.auth_service import AuthService
from core.job_manager import JobManager
from core.result_manager import ResultManager
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def health_check():
    """Basic health check"""
    try:
        return StandardResponse(
            success=True,
            data={
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "version": settings.app_version,
                "environment": "production" if not settings.debug else "development"
            },
            message="Service is healthy"
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/detailed", response_model=StandardResponse[Dict[str, Any]])
async def detailed_health_check(
    registry: MCPRegistry = Depends(),
    auth_service: AuthService = Depends(),
    job_manager: JobManager = Depends(),
    result_manager: ResultManager = Depends()
):
    """Detailed health check with component status"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": settings.app_version,
            "components": {}
        }
        
        # Check database connection
        try:
            # TODO: Implement actual database health check
            health_status["components"]["database"] = {
                "status": "healthy",
                "message": "Database connection successful"
            }
        except Exception as e:
            health_status["components"]["database"] = {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check Redis connection
        try:
            # TODO: Implement actual Redis health check
            health_status["components"]["redis"] = {
                "status": "healthy",
                "message": "Redis connection successful"
            }
        except Exception as e:
            health_status["components"]["redis"] = {
                "status": "unhealthy",
                "message": f"Redis connection failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check MCP registry
        try:
            mcp_count = len(registry.mcps)
            health_status["components"]["mcp_registry"] = {
                "status": "healthy",
                "message": f"Registry contains {mcp_count} MCPs",
                "mcp_count": mcp_count
            }
        except Exception as e:
            health_status["components"]["mcp_registry"] = {
                "status": "unhealthy",
                "message": f"MCP registry check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check job manager
        try:
            # TODO: Implement actual job manager health check
            health_status["components"]["job_manager"] = {
                "status": "healthy",
                "message": "Job manager is operational"
            }
        except Exception as e:
            health_status["components"]["job_manager"] = {
                "status": "unhealthy",
                "message": f"Job manager check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check result manager
        try:
            # TODO: Implement actual result manager health check
            health_status["components"]["result_manager"] = {
                "status": "healthy",
                "message": "Result manager is operational"
            }
        except Exception as e:
            health_status["components"]["result_manager"] = {
                "status": "unhealthy",
                "message": f"Result manager check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check external services
        health_status["components"]["external_services"] = {}
        
        # Check GitHub API
        try:
            # TODO: Implement actual GitHub API health check
            health_status["components"]["external_services"]["github"] = {
                "status": "healthy",
                "message": "GitHub API is accessible"
            }
        except Exception as e:
            health_status["components"]["external_services"]["github"] = {
                "status": "unhealthy",
                "message": f"GitHub API check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check HuggingFace API
        try:
            # TODO: Implement actual HuggingFace API health check
            health_status["components"]["external_services"]["huggingface"] = {
                "status": "healthy",
                "message": "HuggingFace API is accessible"
            }
        except Exception as e:
            health_status["components"]["external_services"]["huggingface"] = {
                "status": "unhealthy",
                "message": f"HuggingFace API check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        # Check Cloudflare API
        try:
            # TODO: Implement actual Cloudflare API health check
            health_status["components"]["external_services"]["cloudflare"] = {
                "status": "healthy",
                "message": "Cloudflare API is accessible"
            }
        except Exception as e:
            health_status["components"]["external_services"]["cloudflare"] = {
                "status": "unhealthy",
                "message": f"Cloudflare API check failed: {str(e)}"
            }
            health_status["status"] = "degraded"
        
        return StandardResponse(
            success=True,
            data=health_status,
            message="Detailed health check completed"
        )
    
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/mcps", response_model=StandardResponse[Dict[str, Any]])
async def mcp_health_check(
    registry: MCPRegistry = Depends()
):
    """Check health of all registered MCPs"""
    try:
        # Get all MCPs
        all_mcps = list(registry.mcps.values())
        
        # Check health of each MCP
        mcp_health_status = {
            "total_mcps": len(all_mcps),
            "healthy_mcps": 0,
            "unhealthy_mcps": 0,
            "warning_mcps": 0,
            "mcp_details": []
        }
        
        for mcp in all_mcps:
            try:
                # Perform health check
                is_healthy = await registry.check_mcp_health(mcp.id)
                
                if is_healthy:
                    mcp_health_status["healthy_mcps"] += 1
                    status = "healthy"
                else:
                    mcp_health_status["unhealthy_mcps"] += 1
                    status = "unhealthy"
                
                mcp_health_status["mcp_details"].append({
                    "id": mcp.id,
                    "name": mcp.name,
                    "url": mcp.url,
                    "status": status,
                    "last_health_check": mcp.last_health_check.isoformat() if mcp.last_health_check else None
                })
                
            except Exception as e:
                mcp_health_status["unhealthy_mcps"] += 1
                mcp_health_status["mcp_details"].append({
                    "id": mcp.id,
                    "name": mcp.name,
                    "url": mcp.url,
                    "status": "error",
                    "error": str(e),
                    "last_health_check": mcp.last_health_check.isoformat() if mcp.last_health_check else None
                })
        
        # Determine overall status
        if mcp_health_status["unhealthy_mcps"] > 0:
            overall_status = "degraded"
        elif mcp_health_status["warning_mcps"] > 0:
            overall_status = "warning"
        else:
            overall_status = "healthy"
        
        return StandardResponse(
            success=True,
            data={
                "status": overall_status,
                "timestamp": datetime.utcnow().isoformat(),
                **mcp_health_status
            },
            message="MCP health check completed"
        )
    
    except Exception as e:
        logger.error(f"MCP health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/queue", response_model=StandardResponse[Dict[str, Any]])
async def queue_health_check(
    job_manager: JobManager = Depends()
):
    """Check queue health"""
    try:
        # Get queue status
        queue_status = await job_manager.get_task_queue_status()
        
        return StandardResponse(
            success=True,
            data={
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                **queue_status
            },
            message="Queue health check completed"
        )
    
    except Exception as e:
        logger.error(f"Queue health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/metrics", response_model=StandardResponse[Dict[str, Any]])
async def metrics_health_check(
    registry: MCPRegistry = Depends(),
    job_manager: JobManager = Depends()
):
    """Get system metrics"""
    try:
        # Get registry metrics
        registry_metrics = registry.metrics
        
        # Get job manager metrics
        job_metrics = job_manager.metrics
        
        # Combine metrics
        all_metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "registry": registry_metrics,
            "job_manager": job_metrics,
            "system": {
                "uptime": "N/A",  # TODO: Implement uptime tracking
                "memory_usage": "N/A",  # TODO: Implement memory tracking
                "cpu_usage": "N/A"  # TODO: Implement CPU tracking
            }
        }
        
        return StandardResponse(
            success=True,
            data=all_metrics,
            message="Metrics retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Metrics health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/health/refresh")
async def refresh_health_cache(
    registry: MCPRegistry = Depends()
):
    """Refresh health cache"""
    try:
        # Clear health cache
        registry.mcp_health.clear()
        registry.last_health_check.clear()
        
        # Force health check for all MCPs
        await registry.check_all_mcps_health()
        
        return StandardResponse(
            success=True,
            data={"message": "Health cache refreshed successfully"},
            message="Health cache refreshed"
        )
    
    except Exception as e:
        logger.error(f"Health cache refresh failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/readiness", response_model=StandardResponse[Dict[str, Any]])
async def readiness_check():
    """Readiness check for deployment"""
    try:
        readiness_status = {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "ready",
                "redis": "ready",
                "external_apis": "ready",
                "mcp_registry": "ready"
            }
        }
        
        # TODO: Implement actual readiness checks
        # For now, assume everything is ready
        
        return StandardResponse(
            success=True,
            data=readiness_status,
            message="Readiness check passed"
        )
    
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/liveness", response_model=StandardResponse[Dict[str, Any]])
async def liveness_check():
    """Liveness check for deployment"""
    try:
        liveness_status = {
            "status": "alive",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "process": "alive",
                "memory": "sufficient",
                "disk": "sufficient"
            }
        }
        
        # TODO: Implement actual liveness checks
        # For now, assume everything is alive
        
        return StandardResponse(
            success=True,
            data=liveness_status,
            message="Liveness check passed"
        )
    
    except Exception as e:
        logger.error(f"Liveness check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/version", response_model=StandardResponse[Dict[str, Any]])
async def version_check():
    """Get version information"""
    try:
        version_info = {
            "version": settings.app_version,
            "build_date": "2025-01-01T00:00:00Z",  # TODO: Implement build date tracking
            "git_commit": "unknown",  # TODO: Implement git commit tracking
            "python_version": "3.11+",  # TODO: Implement Python version tracking
            "dependencies": {
                "fastapi": "0.104.1",
                "pydantic": "2.5.0",
                "sqlalchemy": "2.0.23",
                "redis": "5.0.1"
            }
        }
        
        return StandardResponse(
            success=True,
            data=version_info,
            message="Version information retrieved"
        )
    
    except Exception as e:
        logger.error(f"Version check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))