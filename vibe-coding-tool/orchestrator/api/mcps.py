"""
MCP management API endpoints for Vibe Coding Tool
"""

import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer

from models.mcp import MCPInfo, MCPCreate, MCPUpdate, MCPStatus, Capability
from models.response import StandardResponse
from core.registry import MCPRegistry
from core.auth_service import get_current_user, get_current_active_user
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/mcps", response_model=StandardResponse[MCPInfo])
async def register_mcp(
    mcp: MCPCreate,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Register a new MCP"""
    try:
        # Create MCP info object
        mcp_info = MCPInfo(
            id=mcp.id,
            name=mcp.name,
            url=mcp.url,
            capabilities=mcp.capabilities,
            supported_task_types=mcp.supported_task_types,
            routing_flags=mcp.routing_flags,
            status=MCPStatus.HEALTHY,
            last_health_check=datetime.utcnow()
        )
        
        # Register MCP
        success = await registry.register_mcp(mcp_info)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to register MCP")
        
        return StandardResponse(
            success=True,
            data=mcp_info,
            message="MCP registered successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/{mcp_id}", response_model=StandardResponse[MCPInfo])
async def get_mcp(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCP details"""
    try:
        mcp_info = await registry.get_mcp(mcp_id)
        
        if not mcp_info:
            raise HTTPException(status_code=404, detail="MCP not found")
        
        return StandardResponse(
            success=True,
            data=mcp_info,
            message="MCP retrieved successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps", response_model=StandardResponse[List[MCPInfo]])
async def list_mcps(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends(),
    status: Optional[MCPStatus] = None,
    capability: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all MCPs"""
    try:
        # Get all MCPs
        all_mcps = list(registry.mcps.values())
        
        # Filter by status if provided
        if status:
            all_mcps = [mcp for mcp in all_mcps if mcp.status == status]
        
        # Filter by capability if provided
        if capability:
            all_mcps = [
                mcp for mcp in all_mcps
                if any(cap.name == capability for cap in mcp.capabilities)
            ]
        
        # Apply pagination
        mcps = all_mcps[offset:offset + limit]
        
        return StandardResponse(
            success=True,
            data=mcps,
            message="MCPs retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error listing MCPs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/mcps/{mcp_id}", response_model=StandardResponse[MCPInfo])
async def update_mcp(
    mcp_id: str,
    mcp_update: MCPUpdate,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Update MCP details"""
    try:
        # Get existing MCP
        existing_mcp = await registry.get_mcp(mcp_id)
        
        if not existing_mcp:
            raise HTTPException(status_code=404, detail="MCP not found")
        
        # Update MCP fields
        if mcp_update.name:
            existing_mcp.name = mcp_update.name
        if mcp_update.url:
            existing_mcp.url = mcp_update.url
        if mcp_update.capabilities:
            existing_mcp.capabilities = mcp_update.capabilities
        if mcp_update.supported_task_types:
            existing_mcp.supported_task_types = mcp_update.supported_task_types
        if mcp_update.routing_flags:
            existing_mcp.routing_flags = mcp_update.routing_flags
        
        existing_mcp.last_health_check = datetime.utcnow()
        
        # TODO: Update MCP in registry
        # For now, return the updated MCP
        
        return StandardResponse(
            success=True,
            data=existing_mcp,
            message="MCP updated successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/mcps/{mcp_id}")
async def unregister_mcp(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Unregister an MCP"""
    try:
        success = await registry.unregister_mcp(mcp_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="MCP not found")
        
        return StandardResponse(
            success=True,
            data={"mcp_id": mcp_id},
            message="MCP unregistered successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unregistering MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcps/{mcp_id}/health-check")
async def check_mcp_health(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Check MCP health"""
    try:
        health_status = await registry.check_mcp_health(mcp_id)
        
        return StandardResponse(
            success=True,
            data={"mcp_id": mcp_id, "healthy": health_status},
            message="MCP health checked successfully"
        )
    
    except Exception as e:
        logger.error(f"Error checking MCP health: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcps/health-check-all")
async def check_all_mcps_health(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Check health of all MCPs"""
    try:
        health_results = await registry.check_all_mcps_health()
        
        return StandardResponse(
            success=True,
            data=health_results,
            message="All MCPs health checked successfully"
        )
    
    except Exception as e:
        logger.error(f"Error checking all MCPs health: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/capabilities", response_model=StandardResponse[List[str]])
async def get_mcp_capabilities(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get all available MCP capabilities"""
    try:
        capabilities = list(registry.capability_index.keys())
        
        return StandardResponse(
            success=True,
            data=capabilities,
            message="MCP capabilities retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP capabilities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/capabilities/{capability}/mcps", response_model=StandardResponse[List[MCPInfo]])
async def get_mcps_by_capability(
    capability: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCPs that have a specific capability"""
    try:
        # Create capability object
        cap = Capability(name=capability, version="1.0.0", parameters=set())
        
        mcps = await registry.get_mcps_by_capability(cap)
        
        return StandardResponse(
            success=True,
            data=mcps,
            message="MCPs by capability retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCPs by capability: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/task-types", response_model=StandardResponse[List[str]])
async def get_mcp_task_types(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get all available task types"""
    try:
        task_types = list(registry.task_type_index.keys())
        
        return StandardResponse(
            success=True,
            data=task_types,
            message="MCP task types retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP task types: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/task-types/{task_type}/mcps", response_model=StandardResponse[List[MCPInfo]])
async def get_mcps_by_task_type(
    task_type: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCPs that can handle a specific task type"""
    try:
        # Import TaskType here to avoid circular imports
        from models.task import TaskType
        
        # Convert string to TaskType enum
        task_type_enum = TaskType(task_type)
        
        mcps = await registry.get_mcps_for_task(task_type_enum)
        
        return StandardResponse(
            success=True,
            data=mcps,
            message="MCPs by task type retrieved successfully"
        )
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task type")
    except Exception as e:
        logger.error(f"Error getting MCPs by task type: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/user-space", response_model=StandardResponse[List[MCPInfo]])
async def get_user_space_mcps(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCPs that can run on user space"""
    try:
        mcps = await registry.get_user_space_mcps()
        
        return StandardResponse(
            success=True,
            data=mcps,
            message="User space MCPs retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting user space MCPs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/oracle", response_model=StandardResponse[List[MCPInfo]])
async def get_oracle_mcps(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCPs that run on Oracle"""
    try:
        mcps = await registry.get_oracle_mcps()
        
        return StandardResponse(
            success=True,
            data=mcps,
            message="Oracle MCPs retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting Oracle MCPs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/stats", response_model=StandardResponse[dict])
async def get_mcp_stats(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCP statistics"""
    try:
        stats = await registry.get_mcp_stats()
        
        return StandardResponse(
            success=True,
            data=stats,
            message="MCP statistics retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/{mcp_id}/history", response_model=StandardResponse[List[dict]])
async def get_mcp_history(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends(),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get MCP history"""
    try:
        history = await registry.get_mcp_history(mcp_id, limit)
        
        return StandardResponse(
            success=True,
            data=history,
            message="MCP history retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/{mcp_id}/performance", response_model=StandardResponse[dict])
async def get_mcp_performance(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends(),
    days: int = Query(7, ge=1, le=365)
):
    """Get MCP performance analysis"""
    try:
        performance = await registry.analyze_mcp_performance(mcp_id, days)
        
        return StandardResponse(
            success=True,
            data=performance,
            message="MCP performance analysis retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mcps/optimization", response_model=StandardResponse[dict])
async def optimize_mcp_distribution(
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Get MCP distribution optimization suggestions"""
    try:
        optimization = await registry.optimize_mcp_distribution()
        
        return StandardResponse(
            success=True,
            data=optimization,
            message="MCP optimization analysis retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting MCP optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcps/{mcp_id}/enable")
async def enable_mcp(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Enable an MCP"""
    try:
        success = await registry.update_mcp_status(mcp_id, MCPStatus.HEALTHY)
        
        if not success:
            raise HTTPException(status_code=404, detail="MCP not found")
        
        return StandardResponse(
            success=True,
            data={"mcp_id": mcp_id},
            message="MCP enabled successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcps/{mcp_id}/disable")
async def disable_mcp(
    mcp_id: str,
    current_user: str = Depends(get_current_active_user),
    registry: MCPRegistry = Depends()
):
    """Disable an MCP"""
    try:
        success = await registry.update_mcp_status(mcp_id, MCPStatus.UNHEALTHY)
        
        if not success:
            raise HTTPException(status_code=404, detail="MCP not found")
        
        return StandardResponse(
            success=True,
            data={"mcp_id": mcp_id},
            message="MCP disabled successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disabling MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))