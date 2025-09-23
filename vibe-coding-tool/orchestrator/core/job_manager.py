from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import logging
import uuid
import httpx
from enum import Enum

from models.task import Task, TaskStatus, TaskType
from models.mcp import MCPInfo
from models.job import JobStatus
from models.job import Job, JobCreate
from core.result_manager import ResultManager
from core.auth_service import AuthService
from services.github_service import GitHubService
from services.hf_service import HuggingFaceService

logger = logging.getLogger(__name__)

class JobManager:
    def __init__(
        self, 
        result_manager: ResultManager,
        github_service: GitHubService,
        hf_service: HuggingFaceService,
        auth_service: AuthService
    ):
        self.result_manager = result_manager
        self.github_service = github_service
        self.hf_service = hf_service
        self.auth_service = auth_service
        self.active_jobs = {}
        self.job_queue = asyncio.Queue()
        self.max_concurrent_jobs = 10
    
    async def create_job(self, task: Task, mcp_info: MCPInfo) -> Job:
        """Create a new job"""
        job = Job(
            id=str(uuid.uuid4()),
            task_id=task.id,
            user_id=task.user_id,
            mcp_id=mcp_info.id,
            mcp_url=mcp_info.url,
            status=JobStatus.QUEUED,
            created_at=datetime.utcnow(),
            priority=task.priority,
            timeout=task.timeout or 300,  # 5 minutes default
            retry_count=0,
            max_retries=3
        )
        
        # Store job
        self.active_jobs[job.id] = job
        
        # Add to queue
        await self.job_queue.put(job)
        
        return job
    
    async def process_job(self, job_id: str):
        """Process a job from the queue"""
        try:
            job = self.active_jobs.get(job_id)
            if not job:
                logger.error(f"Job {job_id} not found")
                return
            
            # Check concurrency limits
            if len(self.active_jobs) >= self.max_concurrent_jobs:
                await asyncio.sleep(1)
                await self.job_queue.put(job)
                return
            
            # Update job status
            job.status = JobStatus.RUNNING
            job.started_at = datetime.utcnow()
            
            try:
                # Execute job
                result = await self._execute_job(job)
                
                # Store result
                await self.result_manager.store_result(result)
                
                # Update job status
                job.status = JobStatus.COMPLETED
                job.completed_at = datetime.utcnow()
                job.result_id = result.id
                
            except Exception as e:
                # Handle failure
                await self._handle_job_failure(job, e)
                
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {str(e)}")
            await self._handle_job_failure(job, e)
    
    async def _execute_job(self, job: Job) -> Any:
        """Execute a job on the appropriate MCP"""
        try:
            # Prepare job payload
            payload = {
                'task_id': job.task_id,
                'user_id': job.user_id,
                'input': job.task.input,
                'required_capabilities': job.task.required_capabilities,
                'timeout': job.timeout,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Sign the payload
            signature = self.auth_service.sign_job_payload(payload, job.user_id)
            payload['signature'] = signature
            
            # Execute based on MCP type
            if job.mcp_url.startswith('hf://'):
                # User HF Space
                result = await self._execute_on_hf_space(job, payload)
            else:
                # Oracle-hosted MCP
                result = await self._execute_on_oracle_mcp(job, payload)
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing job {job.id}: {str(e)}")
            raise
    
    async def _execute_on_hf_space(self, job: Job, payload: Dict[str, Any]) -> Any:
        """Execute job on user's HuggingFace Space"""
        try:
            # Get user's HF Space URL
            space_url = await self.hf_service.get_space_url(job.user_id, "vibe-worker")  # Assuming space name
            
            # Send request to HF Space
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{space_url}/execute",
                    json=payload,
                    timeout=job.timeout
                )
                response.raise_for_status()
                
                return await response.json()
                
        except Exception as e:
            logger.error(f"Error executing on HF Space: {str(e)}")
            raise
    
    async def _execute_on_oracle_mcp(self, job: Job, payload: Dict[str, Any]) -> Any:
        """Execute job on Oracle-hosted MCP"""
        try:
            # Send request to MCP
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{job.mcp_url}/execute",
                    json=payload,
                    timeout=job.timeout
                )
                response.raise_for_status()
                
                return await response.json()
                
        except Exception as e:
            logger.error(f"Error executing on Oracle MCP: {str(e)}")
            raise
    
    async def _handle_job_failure(self, job: Job, error: Exception):
        """Handle job failure with retry logic"""
        job.retry_count += 1
        job.error_message = str(error)
        job.last_error_at = datetime.utcnow()
        
        if job.retry_count < job.max_retries:
            # Retry with exponential backoff
            delay = min(2 ** job.retry_count, 60)  # Max 60 seconds
            await asyncio.sleep(delay)
            
            # Reset job status and requeue
            job.status = JobStatus.QUEUED
            job.started_at = None
            await self.job_queue.put(job)
            
        else:
            # Max retries reached
            job.status = JobStatus.FAILED
            job.completed_at = datetime.utcnow()
            
            # Log failure
            logger.error(f"Job {job.id} failed after {job.max_retries} retries")
    
    async def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get task by ID"""
        # Search through active jobs
        for job in self.active_jobs.values():
            if job.task_id == task_id and job.user_id == user_id:
                return job.task
        
        # Check completed jobs in result manager
        return await self.result_manager.get_task(task_id, user_id)
    
    async def list_user_tasks(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        status: Optional[TaskStatus] = None
    ) -> List[Task]:
        """List user's tasks"""
        # Get active tasks
        active_tasks = [
            job.task for job in self.active_jobs.values()
            if job.user_id == user_id and (status is None or job.task.status == status)
        ]
        
        # Get completed tasks from result manager
        completed_tasks = await self.result_manager.list_user_tasks(
            user_id, limit, offset, status
        )
        
        # Combine and sort
        all_tasks = active_tasks + completed_tasks
        all_tasks.sort(key=lambda x: x.created_at, reverse=True)
        
        return all_tasks[:limit]
    
    async def cancel_task(self, task_id: str, user_id: str) -> bool:
        """Cancel a running task"""
        # Check active jobs
        for job_id, job in self.active_jobs.items():
            if job.task_id == task_id and job.user_id == user_id:
                if job.status in [JobStatus.QUEUED, JobStatus.RUNNING]:
                    job.status = JobStatus.CANCELLED
                    job.completed_at = datetime.utcnow()
                    return True
        
        return False