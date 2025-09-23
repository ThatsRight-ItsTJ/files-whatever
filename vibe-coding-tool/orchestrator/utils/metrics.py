"""
Metrics collection for Vibe Coding Tool
"""

import time
from datetime import datetime
from typing import Dict, Any, List
from collections import defaultdict, deque

class MetricsCollector:
    """Collect and manage application metrics"""
    
    def __init__(self, max_metrics: int = 1000):
        self.max_metrics = max_metrics
        self.request_metrics = deque(maxlen=max_metrics)
        self.job_metrics = deque(maxlen=max_metrics)
        self.mcp_metrics = deque(maxlen=max_metrics)
        self.start_time = datetime.utcnow()
    
    async def record_request(self, method: str, path: str, status_code: int, processing_time: float):
        """Record HTTP request metrics"""
        metric = {
            "timestamp": datetime.utcnow().isoformat(),
            "method": method,
            "path": path,
            "status_code": status_code,
            "processing_time": processing_time
        }
        self.request_metrics.append(metric)
    
    async def record_job(self, job_id: str, job_type: str, status: str, duration: float, success: bool):
        """Record job execution metrics"""
        metric = {
            "timestamp": datetime.utcnow().isoformat(),
            "job_id": job_id,
            "job_type": job_type,
            "status": status,
            "duration": duration,
            "success": success
        }
        self.job_metrics.append(metric)
    
    async def record_mcp_call(self, mcp_id: str, tool_name: str, duration: float, success: bool):
        """Record MCP call metrics"""
        metric = {
            "timestamp": datetime.utcnow().isoformat(),
            "mcp_id": mcp_id,
            "tool_name": tool_name,
            "duration": duration,
            "success": success
        }
        self.mcp_metrics.append(metric)
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get aggregated metrics"""
        return {
            "start_time": self.start_time.isoformat(),
            "uptime": (datetime.utcnow() - self.start_time).total_seconds(),
            "requests": self._get_request_metrics(),
            "jobs": self._get_job_metrics(),
            "mcps": self._get_mcp_metrics()
        }
    
    def _get_request_metrics(self) -> Dict[str, Any]:
        """Get request metrics summary"""
        if not self.request_metrics:
            return {
                "total_requests": 0,
                "average_response_time": 0,
                "success_rate": 0,
                "status_codes": {}
            }
        
        total_requests = len(self.request_metrics)
        total_time = sum(m["processing_time"] for m in self.request_metrics)
        successful_requests = sum(1 for m in self.request_metrics if m["status_code"] < 400)
        
        status_codes = defaultdict(int)
        for m in self.request_metrics:
            status_codes[m["status_code"]] += 1
        
        return {
            "total_requests": total_requests,
            "average_response_time": total_time / total_requests,
            "success_rate": (successful_requests / total_requests) * 100,
            "status_codes": dict(status_codes)
        }
    
    def _get_job_metrics(self) -> Dict[str, Any]:
        """Get job metrics summary"""
        if not self.job_metrics:
            return {
                "total_jobs": 0,
                "average_duration": 0,
                "success_rate": 0,
                "status_distribution": {}
            }
        
        total_jobs = len(self.job_metrics)
        total_duration = sum(m["duration"] for m in self.job_metrics)
        successful_jobs = sum(1 for m in self.job_metrics if m["success"])
        
        status_distribution = defaultdict(int)
        for m in self.job_metrics:
            status_distribution[m["status"]] += 1
        
        return {
            "total_jobs": total_jobs,
            "average_duration": total_duration / total_jobs,
            "success_rate": (successful_jobs / total_jobs) * 100,
            "status_distribution": dict(status_distribution)
        }
    
    def _get_mcp_metrics(self) -> Dict[str, Any]:
        """Get MCP metrics summary"""
        if not self.mcp_metrics:
            return {
                "total_calls": 0,
                "average_duration": 0,
                "success_rate": 0,
                "mcp_distribution": {}
            }
        
        total_calls = len(self.mcp_metrics)
        total_duration = sum(m["duration"] for m in self.mcp_metrics)
        successful_calls = sum(1 for m in self.mcp_metrics if m["success"])
        
        mcp_distribution = defaultdict(int)
        for m in self.mcp_metrics:
            mcp_distribution[m["mcp_id"]] += 1
        
        return {
            "total_calls": total_calls,
            "average_duration": total_duration / total_calls,
            "success_rate": (successful_calls / total_calls) * 100,
            "mcp_distribution": dict(mcp_distribution)
        }