from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from fastapi import HTTPException

from models.task import Task, TaskStatus, TaskType
from models.mcp import MCPInfo, MCPStatus, Capability
from core.registry import MCPRegistry
from core.auth_service import AuthService

logger = logging.getLogger(__name__)

class TaskRouter:
    def __init__(self, registry: MCPRegistry, auth_service: AuthService):
        self.registry = registry
        self.auth_service = auth_service
        self.route_cache = {}
    
    async def route_task(self, task: Task, user_id: str) -> MCPInfo:
        """
        Determine the best MCP for executing a task based on:
        - Task requirements and capabilities
        - Resource requirements (light vs heavy)
        - Current MCP health and load
        - User preferences and permissions
        """
        # Check cache first
        cache_key = f"{task.type}_{task.priority}_{user_id}"
        if cache_key in self.route_cache:
            return self.route_cache[cache_key]
        
        # Get available MCPs for this task type
        available_mcps = await self.registry.get_mcps_for_task(
            task.type, 
            user_id=user_id
        )
        
        if not available_mcps:
            raise HTTPException(
                status_code=404,
                detail=f"No MCP available for task type: {task.type}"
            )
        
        # Score MCPs based on suitability
        scored_mcps = self._score_mcps(task, available_mcps)
        
        # Select best MCP
        best_mcp = max(scored_mcps, key=lambda x: x['score'])
        
        # Cache the result
        self.route_cache[cache_key] = best_mcp['mcp_info']
        
        return best_mcp['mcp_info']
    
    def _score_mcps(self, task: Task, mcps: List[MCPInfo]) -> List[Dict[str, Any]]:
        """Score MCPs based on various factors"""
        scored = []
        
        for mcp in mcps:
            score = 0.0
            
            # Capability match (40% weight)
            capability_score = self._calculate_capability_match(task, mcp)
            score += capability_score * 0.4
            
            # Resource suitability (30% weight)
            resource_score = self._calculate_resource_match(task, mcp)
            score += resource_score * 0.3
            
            # Health and load (20% weight)
            health_score = self._calculate_health_score(mcp)
            score += health_score * 0.2
            
            # User preference (10% weight)
            preference_score = self._calculate_user_preference(task, mcp)
            score += preference_score * 0.1
            
            scored.append({
                'mcp_info': mcp,
                'score': score,
                'breakdown': {
                    'capability': capability_score,
                    'resource': resource_score,
                    'health': health_score,
                    'preference': preference_score
                }
            })
        
        return scored
    
    def _calculate_capability_match(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate how well MCP capabilities match task requirements"""
        if not task.required_capabilities:
            return 1.0
        
        matching_capabilities = 0
        for required_cap in task.required_capabilities:
            for mcp_cap in mcp.capabilities:
                if self._capabilities_match(required_cap, mcp_cap):
                    matching_capabilities += 1
                    break
        
        return matching_capabilities / len(task.required_capabilities)
    
    def _calculate_resource_match(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate resource suitability (light vs heavy)"""
        # Check if MCP can handle the task type
        if task.type not in mcp.supported_task_types:
            return 0.0
        
        # Check resource requirements
        if task.is_heavy and not mcp.routing_flags.can_run_on_user_space:
            return 0.0
        elif not task.is_heavy and mcp.routing_flags.requires_user_space:
            return 0.5  # Prefer lightweight MCPs for light tasks
        
        return 1.0
    
    def _calculate_health_score(self, mcp: MCPInfo) -> float:
        """Calculate health score based on MCP status"""
        if mcp.status == MCPStatus.HEALTHY:
            return 1.0
        elif mcp.status == MCPStatus.WARNING:
            return 0.7
        elif mcp.status == MCPStatus.UNHEALTHY:
            return 0.3
        else:
            return 0.0
    
    def _calculate_user_preference(self, task: Task, mcp: MCPInfo) -> float:
        """Calculate user preference score"""
        # This could be based on user history, explicit preferences, etc.
        return 1.0  # Default to neutral
    
    def _capabilities_match(self, required: Capability, available: Capability) -> bool:
        """Check if required capability matches available capability"""
        return (
            required.name == available.name and
            required.version <= available.version and
            required.parameters.issubset(available.parameters)
        )