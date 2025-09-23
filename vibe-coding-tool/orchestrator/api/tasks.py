from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from models.task import Task, TaskCreate, TaskStatus, TaskType
from core.task_router import TaskRouter
from core.job_manager import JobManager
from core.auth_service import AuthService, get_current_user
from api.response import StandardResponse

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/tasks", response_model=StandardResponse[Task])
async def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user),
    task_router: TaskRouter = Depends(),
    job_manager: JobManager = Depends()
):
    """Create a new task"""
    try:
        # Create task object
        task_obj = Task(
            id=str(uuid.uuid4()),
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
    current_user: str = Depends(get_current_user),
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
    current_user: str = Depends(get_current_user),
    job_manager: JobManager = Depends(),
    limit: int = 50,
    offset: int = 0,
    status: Optional[TaskStatus] = None
):
    """List user's tasks"""
    try:
        tasks = await job_manager.list_user_tasks(
            current_user, 
            limit=limit, 
            offset=offset, 
            status=status
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
    current_user: str = Depends(get_current_user),
    job_manager: JobManager = Depends()
):
    """Cancel a running task"""
    try:
        success = await job_manager.cancel_task(task_id, current_user)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found or cannot be cancelled")
        
        return StandardResponse(
            success=True,
            data=None,
            message="Task cancelled successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))