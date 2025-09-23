"""
Job manager for Vibe Coding Tool
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

from models.task import Task, TaskStatus
from models.job import Job, JobStatus, JobPriority
from models.mcp import MCPInfo
from models.response import StandardResponse
from config.settings import settings

logger = logging.getLogger(__name__)

class JobManager:
    """Job manager for creating and executing jobs"""
    
    def __init__(self):
        self.jobs = {}
        self.job_queue = asyncio.Queue()
        self.active_jobs = {}
        self.completed_jobs = {}
        self.failed_jobs = {}
        self.metrics = {
            "total_jobs": 0,
            "completed_jobs": 0,
            "failed_jobs": 0,
            "active_jobs": 0,
            "average_execution_time": 0,
            "queue_size": 0
        }
        self.task_router = None  # Will be injected
        self.result_manager = None  # Will be injected
        self.registry = None  # Will be injected
    
    async def create_job(self, task: Task, mcp_info: MCPInfo) -> Job:
        """Create a new job for a task"""
        job = Job(
            id=f"job_{task.id}_{datetime.utcnow().timestamp()}",
            task_id=task.id,
            mcp_id=mcp_info.id,
            user_id=task.user_id,
            priority=task.priority,
            status=JobStatus.PENDING,
            created_at=datetime.utcnow(),
            input_data=task.input,
            parameters=task.parameters,
            timeout=task.timeout,
            max_retries=task.max_retries,
            metadata=task.metadata
        )
        
        # Store job
        self.jobs[job.id] = job
        await self.job_queue.put(job)
        
        # Update metrics
        self.metrics["total_jobs"] += 1
        self.metrics["queue_size"] = self.job_queue.qsize()
        
        logger.info(f"Created job {job.id} for task {task.id}")
        
        return job
    
    async def process_job(self, job_id: str):
        """Process a job from the queue"""
        try:
            # Get job from queue
            job = await self.job_queue.get()
            
            if job.id != job_id:
                # Wrong job, put it back
                await self.job_queue.put(job)
                return
            
            # Update job status
            job.status = JobStatus.RUNNING
            job.started_at = datetime.utcnow()
            self.active_jobs[job.id] = job
            
            # Update metrics
            self.metrics["active_jobs"] += 1
            self.metrics["queue_size"] = self.job_queue.qsize()
            
            logger.info(f"Processing job {job.id}")
            
            # Execute job
            result = await self._execute_job(job)
            
            # Handle result
            if result.success:
                await self._handle_successful_job(job, result)
            else:
                await self._handle_failed_job(job, result)
            
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {str(e)}")
            await self._handle_failed_job(job, {"success": False, "error": str(e)})
    
    async def _execute_job(self, job: Job) -> Dict[str, Any]:
        """Execute a job on the appropriate MCP"""
        try:
            # Get MCP info
            mcp_info = await self.registry.get_mcp(job.mcp_id)
            if not mcp_info:
                raise ValueError(f"MCP {job.mcp_id} not found")
            
            # Prepare job payload
            payload = {
                "job_id": job.id,
                "task_id": job.task_id,
                "user_id": job.user_id,
                "input_data": job.input_data,
                "parameters": job.parameters,
                "timeout": job.timeout,
                "metadata": job.metadata
            }
            
            # Execute job on MCP
            result = await self._call_mcp(mcp_info, payload)
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing job {job.id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _call_mcp(self, mcp_info: MCPInfo, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Call MCP with the given payload"""
        # This is a placeholder for actual MCP communication
        # In a real implementation, this would make HTTP requests to the MCP
        
        # Simulate MCP call
        await asyncio.sleep(1)  # Simulate processing time
        
        # Return mock result
        return {
            "success": True,
            "result": {
                "output": "Mock result from MCP",
                "metadata": {
                    "processed_at": datetime.utcnow().isoformat(),
                    "mcp_id": mcp_info.id,
                    "mcp_name": mcp_info.name
                }
            },
            "metadata": {
                "execution_time": 1.0,
                "memory_usage": "10MB",
                "cpu_usage": "5%"
            }
        }
    
    async def _handle_successful_job(self, job: Job, result: Dict[str, Any]):
        """Handle a successfully completed job"""
        try:
            # Update job status
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.result = result
            
            # Store result
            await self.result_manager.store_result(job.user_id, job.id, result)
            
            # Update job tracking
            self.active_jobs.pop(job.id, None)
            self.completed_jobs[job.id] = job
            
            # Update metrics
            self.metrics["completed_jobs"] += 1
            self.metrics["active_jobs"] -= 1
            
            # Calculate execution time
            if job.started_at:
                execution_time = (job.completed_at - job.started_at).total_seconds()
                self.metrics["average_execution_time"] = (
                    (self.metrics["average_execution_time"] * (self.metrics["completed_jobs"] - 1) + execution_time) 
                    / self.metrics["completed_jobs"]
                )
            
            logger.info(f"Job {job.id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error handling successful job {job.id}: {str(e)}")
            await self._handle_failed_job(job, {"success": False, "error": str(e)})
    
    async def _handle_failed_job(self, job: Job, result: Dict[str, Any]):
        """Handle a failed job"""
        try:
            # Update job status
            job.status = JobStatus.FAILED
            job.completed_at = datetime.utcnow()
            job.error = result.get("error", "Unknown error")
            
            # Update job tracking
            self.active_jobs.pop(job.id, None)
            self.failed_jobs[job.id] = job
            
            # Update metrics
            self.metrics["failed_jobs"] += 1
            self.metrics["active_jobs"] -= 1
            
            logger.error(f"Job {job.id} failed: {job.error}")
            
        except Exception as e:
            logger.error(f"Error handling failed job {job.id}: {str(e)}")
    
    async def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID"""
        # Check active jobs first
        if job_id in self.active_jobs:
            return self.active_jobs[job_id]
        
        # Check completed jobs
        if job_id in self.completed_jobs:
            return self.completed_jobs[job_id]
        
        # Check failed jobs
        if job_id in self.failed_jobs:
            return self.failed_jobs[job_id]
        
        # Check all jobs
        return self.jobs.get(job_id)
    
    async def get_task_jobs(self, task_id: str) -> List[Job]:
        """Get all jobs for a task"""
        jobs = []
        
        for job in self.jobs.values():
            if job.task_id == task_id:
                jobs.append(job)
        
        return jobs
    
    async def get_user_jobs(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Job]:
        """Get all jobs for a user"""
        user_jobs = []
        
        for job in self.jobs.values():
            if job.user_id == user_id:
                user_jobs.append(job)
        
        # Sort by creation time (newest first)
        user_jobs.sort(key=lambda x: x.created_at, reverse=True)
        
        # Apply pagination
        return user_jobs[offset:offset + limit]
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a job"""
        job = await self.get_job(job_id)
        if not job:
            return False
        
        if job.status in [JobStatus.PENDING, JobStatus.RUNNING]:
            job.status = JobStatus.CANCELLED
            job.completed_at = datetime.utcnow()
            
            # Update job tracking
            if job_id in self.active_jobs:
                self.active_jobs.pop(job_id, None)
            
            logger.info(f"Job {job_id} cancelled")
            return True
        
        return False
    
    async def retry_job(self, job_id: str) -> bool:
        """Retry a failed job"""
        job = await self.get_job(job_id)
        if not job:
            return False
        
        if job.status == JobStatus.FAILED:
            # Reset job status
            job.status = JobStatus.PENDING
            job.error = None
            job.started_at = None
            job.completed_at = None
            
            # Put back in queue
            await self.job_queue.put(job)
            
            # Update metrics
            self.metrics["queue_size"] = self.job_queue.qsize()
            
            logger.info(f"Job {job_id} retried")
            return True
        
        return False
    
    async def get_job_stats(self) -> Dict[str, Any]:
        """Get job statistics"""
        return {
            "metrics": self.metrics,
            "queue_size": self.job_queue.qsize(),
            "active_jobs": len(self.active_jobs),
            "completed_jobs": len(self.completed_jobs),
            "failed_jobs": len(self.failed_jobs),
            "total_jobs": len(self.jobs)
        }
    
    async def cleanup_old_jobs(self, days: int = 30):
        """Clean up old jobs"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        jobs_to_remove = []
        
        for job_id, job in self.jobs.items():
            if job.completed_at and job.completed_at < cutoff_date:
                jobs_to_remove.append(job_id)
        
        for job_id in jobs_to_remove:
            self.jobs.pop(job_id, None)
            self.completed_jobs.pop(job_id, None)
            self.failed_jobs.pop(job_id, None)
        
        logger.info(f"Cleaned up {len(jobs_to_remove)} old jobs")
    
    async def get_job_queue_status(self) -> Dict[str, Any]:
        """Get job queue status"""
        return {
            "queue_size": self.job_queue.qsize(),
            "active_jobs": len(self.active_jobs),
            "pending_jobs": sum(1 for job in self.jobs.values() if job.status == JobStatus.PENDING),
            "running_jobs": sum(1 for job in self.jobs.values() if job.status == JobStatus.RUNNING),
            "completed_jobs": sum(1 for job in self.jobs.values() if job.status == JobStatus.COMPLETED),
            "failed_jobs": sum(1 for job in self.jobs.values() if job.status == JobStatus.FAILED),
            "cancelled_jobs": sum(1 for job in self.jobs.values() if job.status == JobStatus.CANCELLED)
        }
    
    async def get_job_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get job history"""
        history = []
        
        for job in list(self.jobs.values())[-limit:]:
            history.append({
                "job_id": job.id,
                "task_id": job.task_id,
                "mcp_id": job.mcp_id,
                "user_id": job.user_id,
                "status": job.status,
                "priority": job.priority,
                "created_at": job.created_at.isoformat(),
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "error": job.error
            })
        
        return history
    
    async def get_mcp_performance(self, mcp_id: str, days: int = 7) -> Dict[str, Any]:
        """Get MCP performance statistics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        mcp_jobs = []
        
        for job in self.jobs.values():
            if job.mcp_id == mcp_id and job.created_at >= cutoff_date:
                mcp_jobs.append(job)
        
        if not mcp_jobs:
            return {"message": "No jobs found for this MCP in the specified period"}
        
        # Calculate statistics
        total_jobs = len(mcp_jobs)
        successful_jobs = sum(1 for job in mcp_jobs if job.status == JobStatus.COMPLETED)
        failed_jobs = sum(1 for job in mcp_jobs if job.status == JobStatus.FAILED)
        cancelled_jobs = sum(1 for job in mcp_jobs if job.status == JobStatus.CANCELLED)
        
        # Calculate average execution time
        execution_times = []
        for job in mcp_jobs:
            if job.started_at and job.completed_at:
                execution_time = (job.completed_at - job.started_at).total_seconds()
                execution_times.append(execution_time)
        
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
        
        # Calculate success rate
        success_rate = successful_jobs / total_jobs if total_jobs > 0 else 0
        
        return {
            "mcp_id": mcp_id,
            "period_days": days,
            "total_jobs": total_jobs,
            "successful_jobs": successful_jobs,
            "failed_jobs": failed_jobs,
            "cancelled_jobs": cancelled_jobs,
            "success_rate": success_rate,
            "average_execution_time": avg_execution_time,
            "jobs_per_day": total_jobs / days
        }
    
    async def optimize_job_processing(self) -> Dict[str, Any]:
        """Analyze job processing and suggest optimizations"""
        stats = await self.get_job_stats()
        
        optimizations = []
        
        # Check failure rate
        failure_rate = stats["failed_jobs"] / max(1, stats["total_jobs"])
        if failure_rate > 0.1:
            optimizations.append({
                "type": "high_failure_rate",
                "message": f"High job failure rate: {failure_rate:.1%}",
                "suggestion": "Investigate MCP issues or increase timeout/retry settings"
            })
        
        # Check average execution time
        if stats["average_execution_time"] > 300:  # 5 minutes
            optimizations.append({
                "type": "slow_execution",
                "message": f"High average execution time: {stats['average_execution_time']:.1f} seconds",
                "suggestion": "Consider optimizing MCP performance or increasing timeout"
            })
        
        # Check queue size
        if stats["queue_size"] > 100:
            optimizations.append({
                "type": "large_queue",
                "message": f"Large job queue: {stats['queue_size']} jobs",
                "suggestion": "Consider adding more workers or optimizing job processing"
            })
        
        # Check active jobs
        if stats["active_jobs"] > settings.max_concurrent_jobs:
            optimizations.append({
                "type": "overloaded_workers",
                "message": f"Too many active jobs: {stats['active_jobs']} > {settings.max_concurrent_jobs}",
                "suggestion": "Consider increasing worker capacity or implementing job prioritization"
            })
        
        return {
            "current_stats": stats,
            "optimizations": optimizations,
            "timestamp": datetime.utcnow()
        }