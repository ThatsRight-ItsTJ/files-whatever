from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json
import uuid

from models.task import Task, TaskStatus
from models.result import Result, ResultCreate, ResultType
from core.auth_service import AuthService
from services.hf_service import HuggingFaceService

logger = logging.getLogger(__name__)

class ResultManager:
    def __init__(
        self, 
        auth_service: AuthService,
        hf_service: HuggingFaceService
    ):
        self.auth_service = auth_service
        self.hf_service = hf_service
        self.results_cache = {}
        self.cache_ttl = timedelta(hours=1)
    
    async def store_result(self, result: ResultCreate) -> str:
        """Store a result and return its ID"""
        try:
            # Create result object
            result_obj = Result(
                id=str(uuid.uuid4()),
                task_id=result.task_id,
                user_id=result.user_id,
                type=result.type,
                data=result.data,
                metadata=result.metadata,
                created_at=datetime.utcnow()
            )
            
            # Store based on type
            if result.type == ResultType.POINTER:
                # Store in HF Dataset
                pointer_id = await self._store_pointer_result(result_obj)
                result_obj.pointer_id = pointer_id
            else:
                # Store locally
                self.results_cache[result_obj.id] = {
                    'data': result_obj.data,
                    'created_at': result_obj.created_at,
                    'metadata': result_obj.metadata
                }
            
            return result_obj.id
            
        except Exception as e:
            logger.error(f"Error storing result: {str(e)}")
            raise
    
    async def get_result(self, result_id: str, user_id: str) -> Optional[Result]:
        """Get a result by ID"""
        try:
            # Check cache first
            if result_id in self.results_cache:
                cached = self.results_cache[result_id]
                if datetime.utcnow() - cached['created_at'] < self.cache_ttl:
                    return Result(
                        id=result_id,
                        task_id=cached.get('task_id'),
                        user_id=user_id,
                        type=ResultType.DIRECT,
                        data=cached['data'],
                        metadata=cached['metadata'],
                        created_at=cached['created_at']
                    )
                else:
                    # Remove expired cache
                    del self.results_cache[result_id]
            
            # Check if it's a pointer result
            pointer_result = await self._get_pointer_result(result_id, user_id)
            if pointer_result:
                return pointer_result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting result: {str(e)}")
            raise
    
    async def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get task with its result"""
        try:
            # Get task from result manager
            task_result = await self._get_task_result(task_id, user_id)
            if task_result:
                return task_result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting task: {str(e)}")
            raise
    
    async def list_user_tasks(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        status: Optional[TaskStatus] = None
    ) -> List[Task]:
        """List user's completed tasks"""
        try:
            # Get tasks from HF Dataset
            tasks = await self._get_user_tasks_from_hf(user_id, limit, offset, status)
            
            # Add cached tasks
            cached_tasks = [
                result for result in self.results_cache.values()
                if result.get('user_id') == user_id and 
                   (status is None or result.get('status') == status)
            ]
            
            # Combine and sort
            all_tasks = tasks + cached_tasks
            all_tasks.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
            
            return all_tasks[:limit]
            
        except Exception as e:
            logger.error(f"Error listing user tasks: {str(e)}")
            raise
    
    async def _store_pointer_result(self, result: Result) -> str:
        """Store result as pointer in HF Dataset"""
        try:
            # Create pointer data
            pointer_data = {
                'result_id': result.id,
                'task_id': result.task_id,
                'user_id': result.user_id,
                'type': result.type.value,
                'metadata': result.metadata,
                'created_at': result.created_at.isoformat()
            }
            
            # Store in HF Dataset
            pointer_id = await self.hf_service.store_result_pointer(
                result.user_id,
                pointer_data
            )
            
            return pointer_id
            
        except Exception as e:
            logger.error(f"Error storing pointer result: {str(e)}")
            raise
    
    async def _get_pointer_result(self, result_id: str, user_id: str) -> Optional[Result]:
        """Get result from HF Dataset pointer"""
        try:
            # Get pointer from HF Dataset
            pointer_data = await self.hf_service.get_result_pointer(user_id, result_id)
            if not pointer_data:
                return None
            
            # Get actual result data
            result_data = await self.hf_service.get_result_data(
                user_id,
                pointer_data['pointer_id']
            )
            
            if not result_data:
                return None
            
            return Result(
                id=result_id,
                task_id=pointer_data['task_id'],
                user_id=user_id,
                type=ResultType(pointer_data['type']),
                data=result_data,
                metadata=pointer_data['metadata'],
                created_at=datetime.fromisoformat(pointer_data['created_at'])
            )
            
        except Exception as e:
            logger.error(f"Error getting pointer result: {str(e)}")
            return None
    
    async def _get_task_result(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get task with its result"""
        try:
            # Get task from HF Dataset
            task_data = await self.hf_service.get_task_result(user_id, task_id)
            if not task_data:
                return None
            
            # Create task object
            task = Task(
                id=task_data['task_id'],
                user_id=user_id,
                type=task_data['type'],
                priority=task_data.get('priority', 0),
                input=task_data.get('input', {}),
                required_capabilities=task_data.get('required_capabilities', []),
                is_heavy=task_data.get('is_heavy', False),
                status=TaskStatus(task_data.get('status', TaskStatus.COMPLETED.value)),
                created_at=datetime.fromisoformat(task_data['created_at']),
                completed_at=datetime.fromisoformat(task_data['completed_at']) if task_data.get('completed_at') else None
            )
            
            # Add result if available
            if 'result_id' in task_data:
                result = await self.get_result(task_data['result_id'], user_id)
                if result:
                    task.result = result
            
            return task
            
        except Exception as e:
            logger.error(f"Error getting task result: {str(e)}")
            return None
    
    async def _get_user_tasks_from_hf(
        self, 
        user_id: str, 
        limit: int, 
        offset: int,
        status: Optional[TaskStatus] = None
    ) -> List[Task]:
        """Get user's tasks from HF Dataset"""
        try:
            # Get tasks from HF Dataset
            tasks_data = await self.hf_service.list_user_tasks(
                user_id, 
                limit=limit, 
                offset=offset,
                status=status.value if status else None
            )
            
            # Convert to Task objects
            tasks = []
            for task_data in tasks_data:
                task = Task(
                    id=task_data['task_id'],
                    user_id=user_id,
                    type=task_data['type'],
                    priority=task_data.get('priority', 0),
                    input=task_data.get('input', {}),
                    required_capabilities=task_data.get('required_capabilities', []),
                    is_heavy=task_data.get('is_heavy', False),
                    status=TaskStatus(task_data.get('status', TaskStatus.COMPLETED.value)),
                    created_at=datetime.fromisoformat(task_data['created_at']),
                    completed_at=datetime.fromisoformat(task_data['completed_at']) if task_data.get('completed_at') else None
                )
                tasks.append(task)
            
            return tasks
            
        except Exception as e:
            logger.error(f"Error getting user tasks from HF: {str(e)}")
            return []