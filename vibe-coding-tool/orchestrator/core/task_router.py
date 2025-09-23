"""
Task router for Vibe Coding Tool
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

from models.task import Task, TaskStatus, TaskType, TaskPriority
from models.mcp import MCPInfo, MCPStatus, Capability, RoutingFlags
from models.job import Job, JobStatus
from models.response import StandardResponse
from config.settings import settings

logger = logging.getLogger(__name__)

class RoutingDecision(str, Enum):
    """Routing decision types"""
    ORACLE = "oracle"
    USER_SPACE = "user_space"
    HYBRID = "hybrid"
    FALLBACK = "fallback"

class TaskRouter:
    """Task router for routing tasks to appropriate MCPs"""
    
    def __init__(self):
        self.registry = None  # Will be injected
        self.route_cache = {}
        self.cache_ttl = 300  # 5 minutes
        self.routing_history = []
        self.metrics = {
            "total_routes": 0,
            "successful_routes": 0,
            "failed_routes": 0,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    async def route_task(self, task: Task, user_id: str) -> MCPInfo:
        """
        Route a task to the appropriate MCP based on:
        - Task requirements and capabilities
        - Resource requirements (light vs heavy)
        - Current MCP health and load
        - User preferences and permissions
        """
        # Check cache first
        cache_key = self._get_cache_key(task, user_id)
        cached_result = await self._get_cached_route(cache_key)
        if cached_result:
            self.metrics["cache_hits"] += 1
            logger.debug(f"Cache hit for task {task.id}")
            return cached_result
        
        self.metrics["cache_misses"] += 1
        logger.debug(f"Cache miss for task {task.id}")
        
        # Get available MCPs for this task type
        available_mcps = await self.registry.get_mcps_for_task(
            task.type, 
            user_id=user_id
        )
        
        if not available_mcps:
            logger.error(f"No MCP available for task type: {task.type}")
            raise ValueError(f"No MCP available for task type: {task.type}")
        
        # Score MCPs based on suitability
        scored_mcps = await self._score_mcps(task, available_mcps)
        
        # Select best MCP
        best_mcp = max(scored_mcps, key=lambda x: x['score'])
        
        # Cache the result
        await self._cache_route(cache_key, best_mcp['mcp_info'])
        
        # Record routing decision
        await self._record_routing_decision(task, best_mcp)
        
        self.metrics["total_routes"] += 1
        self.metrics["successful_routes"] += 1
        
        logger.info(f"Task {task.id} routed to MCP {best_mcp['mcp_info'].id} with score {best_mcp['score']}")
        
        return best_mcp['mcp_info']
    
    async def _score_mcps(self, task: Task, mcps: List[MCPInfo]) -> List[Dict[str, Any]]:
        """Score MCPs based on various factors"""
        scored = []
        
        for mcp in mcps:
            score = 0.0
            breakdown = {}
            
            # Capability match (40% weight)
            capability_score = await self._calculate_capability_match(task, mcp)
            score += capability_score * 0.4
            breakdown['capability'] = capability_score
            
            # Resource suitability (30% weight)
            resource_score = await self._calculate_resource_match(task, mcp)
            score += resource_score * 0.3
            breakdown['resource'] = resource_score
            
            # Health and load (20% weight)
            health_score = await self._calculate_health_score(mcp)
            score += health_score * 0.2
            breakdown['health'] = health_score
            
            # User preference (10% weight)
            preference_score = await self._calculate_user_preference(task, mcp)
            score += preference_score * 0.1
            breakdown['preference'] = preference_score
            
            scored.append({
                'mcp_info': mcp,
                'score': score,
                'breakdown': breakdown
            })
        
        return scored
    
    async def _calculate_capability_match(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate how well MCP capabilities match task requirements"""
        if not task.required_capabilities:
            return 1.0
        
        matching_capabilities = 0
        for required_cap in task.required_capabilities:
            for mcp_cap in mcp.capabilities:
                if await self._capabilities_match(required_cap, mcp_cap):
                    matching_capabilities += 1
                    break
        
        return matching_capabilities / len(task.required_capabilities)
    
    async def _calculate_resource_match(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate resource suitability (light vs heavy)"""
        # Check if MCP can handle the task type
        if task.type not in mcp.supported_task_types:
            return 0.0
        
        # Check resource requirements
        if task.is_heavy and not mcp.routing_flags.can_run_on_user_space:
            return 0.0
        elif not task.heavy and mcp.routing_flags.requires_user_space:
            return 0.5  # Prefer lightweight MCPs for light tasks
        
        return 1.0
    
    async def _calculate_health_score(self, mcp: MCPInfo) -> float:
        """Calculate health score based on MCP status"""
        if mcp.status == MCPStatus.HEALTHY:
            return 1.0
        elif mcp.status == MCPStatus.WARNING:
            return 0.7
        elif mcp.status == MCPStatus.UNHEALTHY:
            return 0.3
        else:
            return 0.0
    
    async def _calculate_user_preference(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate user preference score"""
        # This could be based on user history, explicit preferences, etc.
        # For now, return neutral score
        return 1.0
    
    async def _capabilities_match(self, required: Capability, available: Capability) -> bool:
        """Check if required capability matches available capability"""
        return (
            required.name == available.name and
            required.version <= available.version and
            required.parameters.issubset(available.parameters)
        )
    
    async def _get_cache_key(self, task: Task, user_id: str) -> str:
        """Generate cache key for task routing"""
        return f"{task.type}_{task.priority}_{task.is_heavy}_{user_id}"
    
    async def _get_cached_route(self, cache_key: str) -> Optional[MCPInfo]:
        """Get cached routing decision"""
        if cache_key in self.route_cache:
            cached_data, timestamp = self.route_cache[cache_key]
            if datetime.utcnow() - timestamp < timedelta(seconds=self.cache_ttl):
                return cached_data
            else:
                # Remove expired cache entry
                del self.route_cache[cache_key]
        return None
    
    async def _cache_route(self, cache_key: str, mcp_info: MCPInfo):
        """Cache routing decision"""
        self.route_cache[cache_key] = (mcp_info, datetime.utcnow())
        
        # Clean up old cache entries if too many
        if len(self.route_cache) > 1000:
            oldest_key = min(self.route_cache.keys(), 
                           key=lambda k: self.route_cache[k][1])
            del self.route_cache[oldest_key]
    
    async def _record_routing_decision(self, task: Task, routing_decision: Dict[str, Any]):
        """Record routing decision for analytics"""
        record = {
            "task_id": task.id,
            "task_type": task.type,
            "mcp_id": routing_decision['mcp_info'].id,
            "mcp_name": routing_decision['mcp_info'].name,
            "score": routing_decision['score'],
            "breakdown": routing_decision['breakdown'],
            "timestamp": datetime.utcnow(),
            "user_id": task.user_id
        }
        
        self.routing_history.append(record)
        
        # Keep only recent history
        if len(self.routing_history) > 10000:
            self.routing_history = self.routing_history[-10000:]
    
    async def get_routing_stats(self) -> Dict[str, Any]:
        """Get routing statistics"""
        return {
            "metrics": self.metrics,
            "cache_size": len(self.route_cache),
            "total_decisions": len(self.routing_history),
            "cache_hit_rate": self.metrics["cache_hits"] / max(1, self.metrics["cache_hits"] + self.metrics["cache_misses"]),
            "success_rate": self.metrics["successful_routes"] / max(1, self.metrics["total_routes"])
        }
    
    async def clear_cache(self):
        """Clear routing cache"""
        self.route_cache.clear()
        logger.info("Routing cache cleared")
    
    async def get_routing_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent routing history"""
        return self.routing_history[-limit:]
    
    async def analyze_routing_patterns(self, days: int = 7) -> Dict[str, Any]:
        """Analyze routing patterns over time"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        recent_history = [
            record for record in self.routing_history
            if record["timestamp"] >= cutoff_date
        ]
        
        if not recent_history:
            return {"message": "No routing history found for the specified period"}
        
        # Analyze by task type
        task_type_stats = {}
        for record in recent_history:
            task_type = record["task_type"]
            if task_type not in task_type_stats:
                task_type_stats[task_type] = {
                    "count": 0,
                    "avg_score": 0,
                    "mcp_usage": {}
                }
            
            task_type_stats[task_type]["count"] += 1
            task_type_stats[task_type]["avg_score"] += record["score"]
            
            mcp_id = record["mcp_id"]
            if mcp_id not in task_type_stats[task_type]["mcp_usage"]:
                task_type_stats[task_type]["mcp_usage"][mcp_id] = 0
            task_type_stats[task_type]["mcp_usage"][mcp_id] += 1
        
        # Calculate averages
        for task_type in task_type_stats:
            stats = task_type_stats[task_type]
            stats["avg_score"] = stats["avg_score"] / stats["count"]
            
            # Find most used MCP
            most_used_mcp = max(stats["mcp_usage"].items(), key=lambda x: x[1])
            stats["most_used_mcp"] = most_used_mcp[0]
            stats["most_used_mcp_count"] = most_used_mcp[1]
        
        return {
            "period_days": days,
            "total_decisions": len(recent_history),
            "task_type_stats": task_type_stats,
            "top_mcps": self._get_top_mcps(recent_history)
        }
    
    def _get_top_mcps(self, history: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
        """Get top MCPs by usage"""
        mcp_usage = {}
        
        for record in history:
            mcp_id = record["mcp_id"]
            if mcp_id not in mcp_usage:
                mcp_usage[mcp_id] = {
                    "id": mcp_id,
                    "name": record["mcp_name"],
                    "usage_count": 0,
                    "avg_score": 0
                }
            
            mcp_usage[mcp_id]["usage_count"] += 1
            mcp_usage[mcp_id]["avg_score"] += record["score"]
        
        # Calculate averages and sort
        for mcp_id in mcp_usage:
            mcp_usage[mcp_id]["avg_score"] = mcp_usage[mcp_id]["avg_score"] / mcp_usage[mcp_id]["usage_count"]
        
        sorted_mcps = sorted(mcp_usage.values(), key=lambda x: x["usage_count"], reverse=True)
        return sorted_mcps[:limit]
    
    async def optimize_routing(self) -> Dict[str, Any]:
        """Analyze routing patterns and suggest optimizations"""
        analysis = await self.analyze_routing_patterns()
        
        optimizations = []
        
        # Check for MCPs with low success rates
        if "task_type_stats" in analysis:
            for task_type, stats in analysis["task_type_stats"].items():
                if stats["avg_score"] < 0.5:
                    optimizations.append({
                        "type": "low_performance_mcp",
                        "task_type": task_type,
                        "message": f"MCP performance for {task_type} is low (avg score: {stats['avg_score']:.2f})",
                        "suggestion": "Consider adding more MCPs for this task type or improving existing ones"
                    })
        
        # Check for cache hit rate
        cache_hit_rate = await self.get_routing_stats()["cache_hit_rate"]
        if cache_hit_rate < 0.3:
            optimizations.append({
                "type": "cache_efficiency",
                "message": f"Cache hit rate is low ({cache_hit_rate:.2%})",
                "suggestion": "Consider increasing cache TTL or optimizing routing logic"
            })
        
        # Check for MCP load balancing
        if "top_mcps" in analysis:
            top_mcp = analysis["top_mcps"][0]
            if top_mcp["usage_count"] > len(analysis["total_decisions"]) * 0.8:
                optimizations.append({
                    "type": "load_balancing",
                    "message": f"MCP {top_mcp['name']} is handling {top_mcp['usage_count']} tasks ({top_mcp['usage_count']/len(analysis['total_decisions']):.1%} of total)",
                    "suggestion": "Consider adding more MCPs or implementing load balancing"
                })
        
        return {
            "analysis": analysis,
            "optimizations": optimizations,
            "timestamp": datetime.utcnow()
        }