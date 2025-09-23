"""
Result manager for Vibe Coding Tool
"""

import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

from models.task import Task, TaskStatus
from models.job import Job, JobStatus
from models.result import Result, ResultStatus, ResultType
from models.response import StandardResponse
from config.settings import settings

logger = logging.getLogger(__name__)

class ResultManager:
    """Result manager for storing and retrieving results"""
    
    def __init__(self):
        self.results = {}
        self.result_cache = {}
        self.cache_ttl = 3600  # 1 hour
        self.metrics = {
            "total_results": 0,
            "cached_results": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "average_storage_size": 0,
            "cleanup_count": 0
        }
        self.storage_backend = settings.result_storage_backend
    
    async def store_result(self, user_id: str, job_id: str, result_data: Dict[str, Any]) -> Result:
        """Store job result"""
        try:
            # Create result object
            result = Result(
                id=f"result_{job_id}_{datetime.utcnow().timestamp()}",
                user_id=user_id,
                job_id=job_id,
                status=ResultStatus.COMPLETED,
                type=self._determine_result_type(result_data),
                data=result_data,
                created_at=datetime.utcnow(),
                metadata=result_data.get("metadata", {})
            )
            
            # Store result based on backend
            if self.storage_backend == "database":
                await self._store_in_database(result)
            elif self.storage_backend == "redis":
                await self._store_in_redis(result)
            elif self.storage_backend == "s3":
                await self._store_in_s3(result)
            else:
                await self._store_in_memory(result)
            
            # Update metrics
            self.metrics["total_results"] += 1
            
            # Cache result
            await self._cache_result(result)
            
            logger.info(f"Stored result {result.id} for job {job_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error storing result for job {job_id}: {str(e)}")
            raise
    
    async def get_result(self, user_id: str, result_id: str) -> Optional[Result]:
        """Get result by ID"""
        try:
            # Check cache first
            cached_result = await self._get_cached_result(result_id)
            if cached_result:
                self.metrics["cache_hits"] += 1
                return cached_result
            
            self.metrics["cache_misses"] += 1
            
            # Get result from storage
            if self.storage_backend == "database":
                result = await self._get_from_database(result_id)
            elif self.storage_backend == "redis":
                result = await self._get_from_redis(result_id)
            elif self.storage_backend == "s3":
                result = await self._get_from_s3(result_id)
            else:
                result = self.results.get(result_id)
            
            if result and result.user_id == user_id:
                # Cache result
                await self._cache_result(result)
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting result {result_id}: {str(e)}")
            return None
    
    async def get_job_results(self, user_id: str, job_id: str) -> List[Result]:
        """Get all results for a job"""
        try:
            results = []
            
            # Get results from storage
            if self.storage_backend == "database":
                results = await self._get_job_results_from_database(user_id, job_id)
            elif self.storage_backend == "redis":
                results = await self._get_job_results_from_redis(user_id, job_id)
            elif self.storage_backend == "s3":
                results = await self._get_job_results_from_s3(user_id, job_id)
            else:
                results = [
                    result for result in self.results.values()
                    if result.user_id == user_id and result.job_id == job_id
                ]
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting results for job {job_id}: {str(e)}")
            return []
    
    async def get_user_results(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Result]:
        """Get all results for a user"""
        try:
            results = []
            
            # Get results from storage
            if self.storage_backend == "database":
                results = await self._get_user_results_from_database(user_id, limit, offset)
            elif self.storage_backend == "redis":
                results = await self._get_user_results_from_redis(user_id, limit, offset)
            elif self.storage_backend == "s3":
                results = await self._get_user_results_from_s3(user_id, limit, offset)
            else:
                user_results = [
                    result for result in self.results.values()
                    if result.user_id == user_id
                ]
                # Sort by creation time (newest first)
                user_results.sort(key=lambda x: x.created_at, reverse=True)
                results = user_results[offset:offset + limit]
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting results for user {user_id}: {str(e)}")
            return []
    
    async def delete_result(self, user_id: str, result_id: str) -> bool:
        """Delete a result"""
        try:
            # Check if result exists and belongs to user
            result = await self.get_result(user_id, result_id)
            if not result:
                return False
            
            # Delete from storage
            if self.storage_backend == "database":
                success = await self._delete_from_database(result_id)
            elif self.storage_backend == "redis":
                success = await self._delete_from_redis(result_id)
            elif self.storage_backend == "s3":
                success = await self._delete_from_s3(result_id)
            else:
                success = result_id in self.results
                if success:
                    del self.results[result_id]
            
            # Remove from cache
            self.result_cache.pop(result_id, None)
            
            if success:
                logger.info(f"Deleted result {result_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error deleting result {result_id}: {str(e)}")
            return False
    
    async def cleanup_old_results(self, days: int = 30):
        """Clean up old results"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            if self.storage_backend == "database":
                await self._cleanup_old_results_from_database(cutoff_date)
            elif self.storage_backend == "redis":
                await self._cleanup_old_results_from_redis(cutoff_date)
            elif self.storage_backend == "s3":
                await self._cleanup_old_results_from_s3(cutoff_date)
            else:
                # Clean up in-memory results
                results_to_remove = [
                    result_id for result_id, result in self.results.items()
                    if result.created_at < cutoff_date
                ]
                
                for result_id in results_to_remove:
                    del self.results[result_id]
            
            # Clean up cache
            self._cleanup_cache()
            
            self.metrics["cleanup_count"] += 1
            
            logger.info(f"Cleaned up old results older than {days} days")
            
        except Exception as e:
            logger.error(f"Error cleaning up old results: {str(e)}")
    
    async def get_result_stats(self) -> Dict[str, Any]:
        """Get result statistics"""
        return {
            "metrics": self.metrics,
            "cache_size": len(self.result_cache),
            "total_results": len(self.results),
            "cache_hit_rate": self.metrics["cache_hits"] / max(1, self.metrics["cache_hits"] + self.metrics["cache_misses"])
        }
    
    async def get_result_history(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get result history for a user"""
        try:
            results = await self.get_user_results(user_id, limit=limit)
            
            history = []
            for result in results:
                history.append({
                    "result_id": result.id,
                    "job_id": result.job_id,
                    "type": result.type,
                    "status": result.status,
                    "created_at": result.created_at.isoformat(),
                    "size": len(json.dumps(result.data)) if result.data else 0,
                    "metadata": result.metadata
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting result history for user {user_id}: {str(e)}")
            return []
    
    async def search_results(self, user_id: str, query: str, limit: int = 50) -> List[Result]:
        """Search results by query"""
        try:
            results = await self.get_user_results(user_id, limit=1000)  # Get more for search
            
            matching_results = []
            query_lower = query.lower()
            
            for result in results:
                # Search in result data
                if result.data:
                    data_str = json.dumps(result.data, default=str).lower()
                    if query_lower in data_str:
                        matching_results.append(result)
                        if len(matching_results) >= limit:
                            break
            
            return matching_results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching results for user {user_id}: {str(e)}")
            return []
    
    async def export_results(self, user_id: str, format: str = "json") -> str:
        """Export user results"""
        try:
            results = await self.get_user_results(user_id, limit=1000)
            
            if format == "json":
                export_data = {
                    "user_id": user_id,
                    "exported_at": datetime.utcnow().isoformat(),
                    "total_results": len(results),
                    "results": [
                        {
                            "result_id": result.id,
                            "job_id": result.job_id,
                            "type": result.type,
                            "status": result.status,
                            "created_at": result.created_at.isoformat(),
                            "data": result.data,
                            "metadata": result.metadata
                        }
                        for result in results
                    ]
                }
                return json.dumps(export_data, indent=2, default=str)
            
            elif format == "csv":
                # Simple CSV export
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write header
                writer.writerow([
                    "result_id", "job_id", "type", "status", 
                    "created_at", "size", "metadata"
                ])
                
                # Write data
                for result in results:
                    writer.writerow([
                        result.id,
                        result.job_id,
                        result.type,
                        result.status,
                        result.created_at.isoformat(),
                        len(json.dumps(result.data)) if result.data else 0,
                        json.dumps(result.metadata)
                    ])
                
                return output.getvalue()
            
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
        except Exception as e:
            logger.error(f"Error exporting results for user {user_id}: {str(e)}")
            raise
    
    async def _determine_result_type(self, result_data: Dict[str, Any]) -> ResultType:
        """Determine result type from result data"""
        if "result" in result_data:
            result_content = result_data["result"]
            if isinstance(result_content, dict):
                if "output" in result_content:
                    return ResultType.OUTPUT
                elif "error" in result_content:
                    return ResultType.ERROR
                elif "metadata" in result_content:
                    return ResultType.METADATA
            elif isinstance(result_content, str):
                if result_content.startswith("http"):
                    return ResultType.URL
                elif result_content.startswith("data:"):
                    return ResultType.DATA
                else:
                    return ResultType.TEXT
        
        return ResultType.OTHER
    
    # Storage backend methods (to be implemented)
    async def _store_in_database(self, result: Result):
        """Store result in database"""
        # TODO: Implement database storage
        self.results[result.id] = result
    
    async def _store_in_redis(self, result: Result):
        """Store result in Redis"""
        # TODO: Implement Redis storage
        self.results[result.id] = result
    
    async def _store_in_s3(self, result: Result):
        """Store result in S3"""
        # TODO: Implement S3 storage
        self.results[result.id] = result
    
    async def _store_in_memory(self, result: Result):
        """Store result in memory"""
        self.results[result.id] = result
    
    async def _get_from_database(self, result_id: str) -> Optional[Result]:
        """Get result from database"""
        # TODO: Implement database retrieval
        return self.results.get(result_id)
    
    async def _get_from_redis(self, result_id: str) -> Optional[Result]:
        """Get result from Redis"""
        # TODO: Implement Redis retrieval
        return self.results.get(result_id)
    
    async def _get_from_s3(self, result_id: str) -> Optional[Result]:
        """Get result from S3"""
        # TODO: Implement S3 retrieval
        return self.results.get(result_id)
    
    async def _get_job_results_from_database(self, user_id: str, job_id: str) -> List[Result]:
        """Get job results from database"""
        # TODO: Implement database query
        return []
    
    async def _get_job_results_from_redis(self, user_id: str, job_id: str) -> List[Result]:
        """Get job results from Redis"""
        # TODO: Implement Redis query
        return []
    
    async def _get_job_results_from_s3(self, user_id: str, job_id: str) -> List[Result]:
        """Get job results from S3"""
        # TODO: Implement S3 query
        return []
    
    async def _get_user_results_from_database(self, user_id: str, limit: int, offset: int) -> List[Result]:
        """Get user results from database"""
        # TODO: Implement database query
        return []
    
    async def _get_user_results_from_redis(self, user_id: str, limit: int, offset: int) -> List[Result]:
        """Get user results from Redis"""
        # TODO: Implement Redis query
        return []
    
    async def _get_user_results_from_s3(self, user_id: str, limit: int, offset: int) -> List[Result]:
        """Get user results from S3"""
        # TODO: Implement S3 query
        return []
    
    async def _delete_from_database(self, result_id: str) -> bool:
        """Delete result from database"""
        # TODO: Implement database deletion
        if result_id in self.results:
            del self.results[result_id]
            return True
        return False
    
    async def _delete_from_redis(self, result_id: str) -> bool:
        """Delete result from Redis"""
        # TODO: Implement Redis deletion
        if result_id in self.results:
            del self.results[result_id]
            return True
        return False
    
    async def _delete_from_s3(self, result_id: str) -> bool:
        """Delete result from S3"""
        # TODO: Implement S3 deletion
        if result_id in self.results:
            del self.results[result_id]
            return True
        return False
    
    async def _cleanup_old_results_from_database(self, cutoff_date: datetime):
        """Clean up old results from database"""
        # TODO: Implement database cleanup
        pass
    
    async def _cleanup_old_results_from_redis(self, cutoff_date: datetime):
        """Clean up old results from Redis"""
        # TODO: Implement Redis cleanup
        pass
    
    async def _cleanup_old_results_from_s3(self, cutoff_date: datetime):
        """Clean up old results from S3"""
        # TODO: Implement S3 cleanup
        pass
    
    async def _cache_result(self, result: Result):
        """Cache result"""
        self.result_cache[result.id] = (result, datetime.utcnow())
        
        # Clean up old cache entries if too many
        if len(self.result_cache) > 1000:
            oldest_key = min(self.result_cache.keys(), 
                           key=lambda k: self.result_cache[k][1])
            del self.result_cache[oldest_key]
    
    async def _get_cached_result(self, result_id: str) -> Optional[Result]:
        """Get cached result"""
        if result_id in self.result_cache:
            cached_data, timestamp = self.result_cache[result_id]
            if datetime.utcnow() - timestamp < timedelta(seconds=self.cache_ttl):
                return cached_data
            else:
                # Remove expired cache entry
                del self.result_cache[result_id]
        return None
    
    def _cleanup_cache(self):
        """Clean up expired cache entries"""
        current_time = datetime.utcnow()
        expired_keys = [
            key for key, (_, timestamp) in self.result_cache.items()
            if current_time - timestamp >= timedelta(seconds=self.cache_ttl)
        ]
        
        for key in expired_keys:
            del self.result_cache[key]