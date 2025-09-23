"""
Task management API endpoints for Vibe Coding Tool
"""

import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.security import HTTPBearer

from models.task import Task, TaskCreate, TaskStatus, TaskType, TaskPriority
from models.response import StandardResponse
from core.task_router import TaskRouter
from core.job_manager import JobManager
from core.auth_service import get_current_user, get_current_active_user
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/tasks", response_model=StandardResponse[Task])
async def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_active_user),
    task_router: TaskRouter = Depends(),
    job_manager: JobManager = Depends()
):
    """Create a new task"""
    try:
        # Create task object
        task_obj = Task(
            id=f"task_{datetime.utcnow().timestamp()}",
            user_id=current_user,
            type=task.type,
            priority=task.priority,
            input=task.input,
            required_capabilities=task.required_capabilities,
            is_heavy=task.is_heavy,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow()
        )
        
        # Route task to appropriate MCP
        mcp_info = await task_router.route_task(task_obj, current_user)
        
        # Create job
        job = await job_manager.create_job(task_obj, mcp_info)
        
        # Add to background queue
        background_tasks.add_task(job_manager.process_job, job.id)
        
        return StandardResponse(
            success=True,
            data=task_obj,
            message="Task created successfully"
        )
    
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}", response_model=StandardResponse[Task])
async def get_task(
    task_id: str,
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Get task status and result"""
    try:
        task = await job_manager.get_task(task_id, current_user)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return StandardResponse(
            success=True,
            data=task,
            message="Task retrieved successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks", response_model=StandardResponse[List[Task]])
async def list_tasks(
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends(),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[TaskStatus] = None,
    task_type: Optional[TaskType] = None,
    priority: Optional[TaskPriority] = None
):
    """List user's tasks"""
    try:
        tasks = await job_manager.list_user_tasks(
            current_user, 
            limit=limit, 
            offset=offset, 
            status=status,
            task_type=task_type,
            priority=priority
        )
        
        return StandardResponse(
            success=True,
            data=tasks,
            message="Tasks retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/cancel")
async def cancel_task(
    task_id: str,
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Cancel a running task"""
    try:
        success = await job_manager.cancel_job(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found or cannot be cancelled")
        
        return StandardResponse(
            success=True,
            data={"task_id": task_id},
            message="Task cancelled successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/retry")
async def retry_task(
    task_id: str,
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Retry a failed task"""
    try:
        success = await job_manager.retry_job(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found or cannot be retried")
        
        return StandardResponse(
            success=True,
            data={"task_id": task_id},
            message="Task retried successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrying task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}/results", response_model=StandardResponse[List])
async def get_task_results(
    task_id: str,
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Get results for a specific task"""
    try:
        results = await job_manager.get_task_results(task_id, current_user)
        
        return StandardResponse(
            success=True,
            data=results,
            message="Task results retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/stats", response_model=StandardResponse[dict])
async def get_task_stats(
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Get task statistics for the current user"""
    try:
        stats = await job_manager.get_task_stats(current_user)
        
        return StandardResponse(
            success=True,
            data=stats,
            message="Task statistics retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Delete a task"""
    try:
        success = await job_manager.delete_task(task_id, current_user)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return StandardResponse(
            success=True,
            data={"task_id": task_id},
            message="Task deleted successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/types", response_model=StandardResponse[List[TaskType]])
async def get_task_types():
    """Get available task types"""
    try:
        task_types = list(TaskType)
        
        return StandardResponse(
            success=True,
            data=task_types,
            message="Task types retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task types: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/priorities", response_model=StandardResponse[List[TaskPriority]])
async def get_task_priorities():
    """Get available task priorities"""
    try:
        priorities = list(TaskPriority)
        
        return StandardResponse(
            success=True,
            data=priorities,
            message="Task priorities retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task priorities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/history", response_model=StandardResponse[List[dict]])
async def get_task_history(
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends(),
    limit: int = Query(100, ge=1, le=1000),
    days: int = Query(7, ge=1, le=365)
):
    """Get task history for the current user"""
    try:
        history = await job_manager.get_task_history(current_user, limit, days)
        
        return StandardResponse(
            success=True,
            data=history,
            message="Task history retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/bulk")
async def create_bulk_tasks(
    tasks: List[TaskCreate],
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_active_user),
    task_router: TaskRouter = Depends(),
    job_manager: JobManager = Depends()
):
    """Create multiple tasks at once"""
    try:
        created_tasks = []
        
        for task_data in tasks:
            # Create task object
            task_obj = Task(
                id=f"task_{datetime.utcnow().timestamp()}",
                user_id=current_user,
                type=task_data.type,
                priority=task_data.priority,
                input=task_data.input,
                required_capabilities=task_data.required_capabilities,
                is_heavy=task_data.is_heavy,
                status=TaskStatus.PENDING,
                created_at=datetime.utcnow()
            )
            
            # Route task to appropriate MCP
            mcp_info = await task_router.route_task(task_obj, current_user)
            
            # Create job
            job = await job_manager.create_job(task_obj, mcp_info)
            
            # Add to background queue
            background_tasks.add_task(job_manager.process_job, job.id)
            
            created_tasks.append(task_obj)
        
        return StandardResponse(
            success=True,
            data=created_tasks,
            message=f"Created {len(created_tasks)} tasks successfully"
        )
    
    except Exception as e:
        logger.error(f"Error creating bulk tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/queue-status", response_model=StandardResponse[dict])
async def get_task_queue_status(
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends()
):
    """Get task queue status"""
    try:
        status = await job_manager.get_task_queue_status()
        
        return StandardResponse(
            success=True,
            data=status,
            message="Task queue status retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task queue status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/analysis", response_model=StandardResponse[dict])
async def get_task_analysis(
    current_user: str = Depends(get_current_active_user),
    job_manager: JobManager = Depends(),
    days: int = Query(7, ge=1, le=365)
):
    """Get task analysis for the current user"""
    try:
        analysis = await job_manager.analyze_task_performance(current_user, days)
        
        return StandardResponse(
            success=True,
            data=analysis,
            message="Task analysis retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting task analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))