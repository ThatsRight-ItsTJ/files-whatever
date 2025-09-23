"""
MCP registry for Vibe Coding Tool
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

from models.mcp import MCPInfo, MCPStatus, Capability, RoutingFlags
from models.task import TaskType
from models.response import StandardResponse
from config.settings import settings

logger = logging.getLogger(__name__)

class MCPRegistry:
    """MCP registry for managing MCP servers"""
    
    def __init__(self):
        self.mcps = {}
        self.mcp_health = {}
        self.capability_index = {}
        self.health_check_interval = settings.mcp_health_check_interval
        self.last_health_check = {}
        self.metrics = {
            "total_mcps": 0,
            "healthy_mcps": 0,
            "warning_mcps": 0,
            "unhealthy_mcps": 0,
            "health_check_count": 0,
            "health_check_failures": 0
        }
        self.task_type_index = {}
        self.user_space_mcps = set()
        self.oracle_mcps = set()
    
    async def register_mcp(self, mcp_info: MCPInfo) -> bool:
        """Register a new MCP"""
        try:
            # Store MCP
            self.mcps[mcp_info.id] = mcp_info
            
            # Update capability index
            await self._update_capability_index(mcp_info)
            
            # Update task type index
            await self._update_task_type_index(mcp_info)
            
            # Update routing flags index
            if mcp_info.routing_flags.can_run_on_user_space:
                self.user_space_mcps.add(mcp_info.id)
            if not mcp_info.routing_flags.requires_user_space:
                self.oracle_mcps.add(mcp_info.id)
            
            # Update metrics
            self.metrics["total_mcps"] += 1
            
            logger.info(f"Registered MCP {mcp_info.id}: {mcp_info.name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error registering MCP {mcp_info.id}: {str(e)}")
            return False
    
    async def unregister_mcp(self, mcp_id: str) -> bool:
        """Unregister an MCP"""
        try:
            # Get MCP info
            mcp_info = self.mcps.get(mcp_id)
            if not mcp_info:
                return False
            
            # Remove MCP
            del self.mcps[mcp_id]
            
            # Remove from capability index
            await self._remove_from_capability_index(mcp_info)
            
            # Remove from task type index
            await self._remove_from_task_type_index(mcp_info)
            
            # Remove from routing flags index
            self.user_space_mcps.discard(mcp_id)
            self.oracle_mcps.discard(mcp_id)
            
            # Remove health info
            self.mcp_health.pop(mcp_id, None)
            self.last_health_check.pop(mcp_id, None)
            
            # Update metrics
            self.metrics["total_mcps"] -= 1
            
            logger.info(f"Unregistered MCP {mcp_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error unregistering MCP {mcp_id}: {str(e)}")
            return False
    
    async def get_mcp(self, mcp_id: str) -> Optional[MCPInfo]:
        """Get MCP by ID"""
        return self.mcps.get(mcp_id)
    
    async def get_mcps_for_task(self, task_type: TaskType, user_id: Optional[str] = None) -> List[MCPInfo]:
        """Get MCPs that can handle a specific task type"""
        try:
            # Get MCPs for task type
            mcp_ids = self.task_type_index.get(task_type, [])
            
            # Filter by user permissions if provided
            if user_id:
                mcp_ids = [mcp_id for mcp_id in mcp_ids if await self._check_user_permissions(mcp_id, user_id)]
            
            # Get MCP info
            mcps = [self.mcps[mcp_id] for mcp_id in mcp_ids if mcp_id in self.mcps]
            
            return mcps
            
        except Exception as e:
            logger.error(f"Error getting MCPs for task type {task_type}: {str(e)}")
            return []
    
    async def get_mcps_by_capability(self, capability: Capability) -> List[MCPInfo]:
        """Get MCPs that have a specific capability"""
        try:
            # Get MCPs with capability
            mcp_ids = self.capability_index.get(capability.name, [])
            
            # Filter by capability version and parameters
            mcps = []
            for mcp_id in mcp_ids:
                mcp = self.mcps.get(mcp_id)
                if mcp and await self._check_capability_match(capability, mcp):
                    mcps.append(mcp)
            
            return mcps
            
        except Exception as e:
            logger.error(f"Error getting MCPs for capability {capability.name}: {str(e)}")
            return []
    
    async def get_user_space_mcps(self) -> List[MCPInfo]:
        """Get all MCPs that can run on user space"""
        return [self.mcps[mcp_id] for mcp_id in self.user_space_mcps if mcp_id in self.mcps]
    
    async def get_oracle_mcps(self) -> List[MCPInfo]:
        """Get all MCPs that run on Oracle"""
        return [self.mcps[mcp_id] for mcp_id in self.oracle_mcps if mcp_id in self.mcps]
    
    async def check_mcp_health(self, mcp_id: str) -> bool:
        """Check health of a specific MCP"""
        try:
            mcp_info = self.mcps.get(mcp_id)
            if not mcp_info:
                return False
            
            # Check if we need to perform health check
            last_check = self.last_health_check.get(mcp_id)
            if last_check and datetime.utcnow() - last_check < timedelta(seconds=self.health_check_interval):
                return self.mcp_health.get(mcp_id, False)
            
            # Perform health check
            health_status = await self._perform_health_check(mcp_info)
            
            # Update health info
            self.mcp_health[mcp_id] = health_status
            self.last_health_check[mcp_id] = datetime.utcnow()
            
            # Update MCP status
            if health_status:
                mcp_info.status = MCPStatus.HEALTHY
            else:
                mcp_info.status = MCPStatus.UNHEALTHY
            
            # Update metrics
            self.metrics["health_check_count"] += 1
            if not health_status:
                self.metrics["health_check_failures"] += 1
            
            logger.info(f"Health check for MCP {mcp_id}: {'Healthy' if health_status else 'Unhealthy'}")
            
            return health_status
            
        except Exception as e:
            logger.error(f"Error checking health for MCP {mcp_id}: {str(e)}")
            return False
    
    async def check_all_mcps_health(self) -> Dict[str, bool]:
        """Check health of all MCPs"""
        results = {}
        
        for mcp_id in self.mcps:
            results[mcp_id] = await self.check_mcp_health(mcp_id)
        
        # Update metrics
        healthy_count = sum(1 for status in results.values() if status)
        self.metrics["healthy_mcps"] = healthy_count
        self.metrics["warning_mcps"] = 0  # TODO: Implement warning status
        self.metrics["unhealthy_mcps"] = len(results) - healthy_count
        
        return results
    
    async def update_mcp_status(self, mcp_id: str, status: MCPStatus):
        """Update MCP status"""
        try:
            mcp_info = self.mcps.get(mcp_id)
            if not mcp_info:
                return False
            
            old_status = mcp_info.status
            mcp_info.status = status
            
            logger.info(f"Updated MCP {mcp_id} status from {old_status} to {status}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating MCP {mcp_id} status: {str(e)}")
            return False
    
    async def get_mcp_stats(self) -> Dict[str, Any]:
        """Get MCP statistics"""
        return {
            "metrics": self.metrics,
            "total_mcps": len(self.mcps),
            "healthy_mcps": sum(1 for mcp in self.mcps.values() if mcp.status == MCPStatus.HEALTHY),
            "warning_mcps": sum(1 for mcp in self.mcps.values() if mcp.status == MCPStatus.WARNING),
            "unhealthy_mcps": sum(1 for mcp in self.mcps.values() if mcp.status == MCPStatus.UNHEALTHY),
            "user_space_mcps": len(self.user_space_mcps),
            "oracle_mcps": len(self.oracle_mcps),
            "capability_count": len(self.capability_index),
            "task_type_count": len(self.task_type_index)
        }
    
    async def get_mcp_history(self, mcp_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get MCP history"""
        # TODO: Implement MCP history tracking
        return []
    
    async def analyze_mcp_performance(self, days: int = 7) -> Dict[str, Any]:
        """Analyze MCP performance"""
        # TODO: Implement MCP performance analysis
        return {"message": "MCP performance analysis not implemented yet"}
    
    async def optimize_mcp_distribution(self) -> Dict[str, Any]:
        """Analyze MCP distribution and suggest optimizations"""
        try:
            stats = await self.get_mcp_stats()
            
            optimizations = []
            
            # Check for unhealthy MCPs
            unhealthy_ratio = stats["unhealthy_mcps"] / max(1, stats["total_mcps"])
            if unhealthy_ratio > 0.3:
                optimizations.append({
                    "type": "high_unhealthy_rate",
                    "message": f"High unhealthy MCP rate: {unhealthy_ratio:.1%}",
                    "suggestion": "Investigate MCP issues or implement better health monitoring"
                })
            
            # Check for capability gaps
            capability_coverage = await self._analyze_capability_coverage()
            if capability_coverage["missing_capabilities"]:
                optimizations.append({
                    "type": "capability_gaps",
                    "message": f"Missing capabilities: {capability_coverage['missing_capabilities']}",
                    "suggestion": "Consider adding MCPs with missing capabilities"
                })
            
            # Check for task type coverage
            task_type_coverage = await self._analyze_task_type_coverage()
            if task_type_coverage["missing_task_types"]:
                optimizations.append({
                    "type": "task_type_gaps",
                    "message": f"Missing task type coverage: {task_type_coverage['missing_task_types']}",
                    "suggestion": "Consider adding MCPs for missing task types"
                })
            
            # Check for load balancing
            load_balance_analysis = await self._analyze_load_balancing()
            if load_balance_analysis["imbalanced"]:
                optimizations.append({
                    "type": "load_balancing",
                    "message": "MCP load is imbalanced",
                    "suggestion": "Consider adding more MCPs or implementing load balancing"
                })
            
            return {
                "current_stats": stats,
                "capability_coverage": capability_coverage,
                "task_type_coverage": task_type_coverage,
                "load_balance_analysis": load_balance_analysis,
                "optimizations": optimizations,
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing MCP distribution: {str(e)}")
            return {"error": str(e)}
    
    async def _update_capability_index(self, mcp_info: MCPInfo):
        """Update capability index for MCP"""
        for capability in mcp_info.capabilities:
            if capability.name not in self.capability_index:
                self.capability_index[capability.name] = []
            
            if mcp_info.id not in self.capability_index[capability.name]:
                self.capability_index[capability.name].append(mcp_info.id)
    
    async def _remove_from_capability_index(self, mcp_info: MCPInfo):
        """Remove MCP from capability index"""
        for capability in mcp_info.capabilities:
            if capability.name in self.capability_index:
                if mcp_info.id in self.capability_index[capability.name]:
                    self.capability_index[capability.name].remove(mcp_info.id)
                
                # Remove empty capability entries
                if not self.capability_index[capability.name]:
                    del self.capability_index[capability.name]
    
    async def _update_task_type_index(self, mcp_info: MCPInfo):
        """Update task type index for MCP"""
        for task_type in mcp_info.supported_task_types:
            if task_type not in self.task_type_index:
                self.task_type_index[task_type] = []
            
            if mcp_info.id not in self.task_type_index[task_type]:
                self.task_type_index[task_type].append(mcp_info.id)
    
    async def _remove_from_task_type_index(self, mcp_info: MCPInfo):
        """Remove MCP from task type index"""
        for task_type in mcp_info.supported_task_types:
            if task_type in self.task_type_index:
                if mcp_info.id in self.task_type_index[task_type]:
                    self.task_type_index[task_type].remove(mcp_info.id)
                
                # Remove empty task type entries
                if not self.task_type_index[task_type]:
                    del self.task_type_index[task_type]
    
    async def _check_user_permissions(self, mcp_id: str, user_id: str) -> bool:
        """Check if user has permissions to use MCP"""
        # TODO: Implement user permission checking
        return True
    
    async def _check_capability_match(self, required: Capability, mcp: MCPInfo) -> bool:
        """Check if MCP capability matches required capability"""
        for mcp_cap in mcp.capabilities:
            if (mcp_cap.name == required.name and 
                mcp_cap.version >= required.version and 
                required.parameters.issubset(mcp_cap.parameters)):
                return True
        return False
    
    async def _perform_health_check(self, mcp_info: MCPInfo) -> bool:
        """Perform health check on MCP"""
        try:
            # This is a placeholder for actual health check
            # In a real implementation, this would make HTTP requests to the MCP
            
            # Simulate health check
            await asyncio.sleep(0.1)  # Simulate network delay
            
            # Return random health status for demo
            import random
            return random.random() > 0.1  # 90% chance of healthy
            
        except Exception as e:
            logger.error(f"Error performing health check for MCP {mcp_info.id}: {str(e)}")
            return False
    
    async def _analyze_capability_coverage(self) -> Dict[str, Any]:
        """Analyze capability coverage"""
        # TODO: Implement capability coverage analysis
        return {
            "total_capabilities": len(self.capability_index),
            "covered_capabilities": len(self.capability_index),
            "missing_capabilities": []
        }
    
    async def _analyze_task_type_coverage(self) -> Dict[str, Any]:
        """Analyze task type coverage"""
        # TODO: Implement task type coverage analysis
        return {
            "total_task_types": len(self.task_type_index),
            "covered_task_types": len(self.task_type_index),
            "missing_task_types": []
        }
    
    async def _analyze_load_balancing(self) -> Dict[str, Any]:
        """Analyze MCP load balancing"""
        # TODO: Implement load balancing analysis
        return {
            "imbalanced": False,
            "most_loaded_mcp": None,
            "least_loaded_mcp": None,
            "load_distribution": {}
        }
    
    async def cleanup_old_health_data(self, days: int = 7):
        """Clean up old health check data"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Remove old health check entries
            old_entries = [
                mcp_id for mcp_id, timestamp in self.last_health_check.items()
                if timestamp < cutoff_date
            ]
            
            for mcp_id in old_entries:
                self.last_health_check.pop(mcp_id, None)
                self.mcp_health.pop(mcp_id, None)
            
            logger.info(f"Cleaned up {len(old_entries)} old health check entries")
            
        except Exception as e:
            logger.error(f"Error cleaning up old health data: {str(e)}")
    
    async def register_default_mcps(self):
        """Register default MCP servers"""
        try:
            # Register some default MCPs for testing
            from models.mcp import MCPInfo, MCPStatus, Capability, RoutingFlags
            
            # Example MCPs
            default_mcps = [
                MCPInfo(
                    id="github-mcp",
                    name="GitHub MCP",
                    url="https://github-mcp.example.com",
                    status=MCPStatus.HEALTHY,
                    capabilities=[
                        Capability(name="file_operations", version="1.0.0", parameters={"read", "write"}),
                        Capability(name="repository_management", version="1.0.0", parameters={"create", "delete"})
                    ],
                    supported_task_types=["file_search", "repo_management"],
                    routing_flags=RoutingFlags(
                        can_run_on_user_space=False,
                        result_pointer_preferred=False,
                        fallback_to_oracle=True,
                        priority=1,
                        max_concurrent_jobs=5,
                        timeout=300
                    ),
                    description="GitHub MCP for repository and file operations",
                    metadata={}
                ),
                MCPInfo(
                    id="hf-mcp",
                    name="HuggingFace MCP",
                    url="https://hf-mcp.example.com",
                    status=MCPStatus.HEALTHY,
                    capabilities=[
                        Capability(name="model_inference", version="1.0.0", parameters={"inference"}),
                        Capability(name="dataset_management", version="1.0.0", parameters={"upload", "download"})
                    ],
                    supported_task_types=["kg_generation", "agent_execution"],
                    routing_flags=RoutingFlags(
                        can_run_on_user_space=True,
                        result_pointer_preferred=False,
                        fallback_to_oracle=True,
                        priority=2,
                        max_concurrent_jobs=5,
                        timeout=300
                    ),
                    description="HuggingFace MCP for model inference and dataset management",
                    metadata={}
                ),
                MCPInfo(
                    id="docker-mcp",
                    name="Docker MCP",
                    url="https://docker-mcp.example.com",
                    status=MCPStatus.HEALTHY,
                    capabilities=[
                        Capability(name="container_management", version="1.0.0", parameters={"create", "start", "stop"}),
                        Capability(name="image_management", version="1.0.0", parameters={"build", "push", "pull"})
                    ],
                    supported_task_types=["repo_management", "custom"],
                    routing_flags=RoutingFlags(
                        can_run_on_user_space=False,
                        result_pointer_preferred=False,
                        fallback_to_oracle=True,
                        priority=1,
                        max_concurrent_jobs=5,
                        timeout=300
                    ),
                    description="Docker MCP for container and image management",
                    metadata={}
                )
            ]
            
            # Register each MCP
            for mcp in default_mcps:
                await self.register_mcp(mcp)
            
            logger.info(f"Registered {len(default_mcps)} default MCPs")
            
        except Exception as e:
            logger.error(f"Error registering default MCPs: {str(e)}")