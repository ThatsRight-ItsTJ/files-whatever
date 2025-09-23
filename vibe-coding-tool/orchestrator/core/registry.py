from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json
import asyncio
import httpx

from models.mcp import MCPInfo, MCPStatus, Capability, RoutingFlags
from core.auth_service import AuthService
from services.github_service import GitHubService
from services.hf_service import HuggingFaceService

logger = logging.getLogger(__name__)

class MCPRegistry:
    def __init__(
        self,
        auth_service: AuthService,
        github_service: GitHubService,
        hf_service: HuggingFaceService
    ):
        self.auth_service = auth_service
        self.github_service = github_service
        self.hf_service = hf_service
        self.registry = {}
        self.health_cache = {}
        self.health_cache_ttl = timedelta(minutes=5)
        self.load_registry()
    
    def load_registry(self):
        """Load MCP registry from configuration"""
        try:
            # Load built-in MCPs
            self._load_builtin_mcps()
            
            # Load user MCPs
            asyncio.create_task(self._load_user_mcps())
            
        except Exception as e:
            logger.error(f"Error loading registry: {str(e)}")
    
    def _load_builtin_mcps(self):
        """Load built-in MCPs"""
        builtin_mcps = [
            MCPInfo(
                id="github-mcp",
                name="GitHub MCP",
                url="https://github.com/github/mcp",
                capabilities=[
                    Capability(
                        name="file_operations",
                        version="1.0.0",
                        parameters={"read", "write", "search"}
                    ),
                    Capability(
                        name="repository_management",
                        version="1.0.0",
                        parameters={"create", "clone", "commit"}
                    )
                ],
                supported_task_types=["file_search", "repo_management"],
                routing_flags=RoutingFlags(
                    can_run_on_user_space=False,
                    result_pointer_preferred=False,
                    fallback_to_oracle=True
                ),
                status=MCPStatus.HEALTHY,
                last_health_check=datetime.utcnow()
            ),
            MCPInfo(
                id="tree-sitter-mcp",
                name="Tree-sitter MCP",
                url="https://github.com/wrale/mcp-server-tree-sitter",
                capabilities=[
                    Capability(
                        name="code_analysis",
                        version="1.0.0",
                        parameters={"parse", "ast", "semantic"}
                    )
                ],
                supported_task_types=["code_analysis", "ast_parsing"],
                routing_flags=RoutingFlags(
                    can_run_on_user_space=True,
                    result_pointer_preferred=True,
                    fallback_to_oracle=False
                ),
                status=MCPStatus.HEALTHY,
                last_health_check=datetime.utcnow()
            ),
            MCPInfo(
                id="semgrep-mcp",
                name="Semgrep MCP",
                url="https://github.com/semgrep/mcp",
                capabilities=[
                    Capability(
                        name="security_analysis",
                        version="1.0.0",
                        parameters={"scan", "vulnerability", "sast"}
                    )
                ],
                supported_task_types=["security_scan", "vulnerability_analysis"],
                routing_flags=RoutingFlags(
                    can_run_on_user_space=True,
                    result_pointer_preferred=True,
                    fallback_to_oracle=False
                ),
                status=MCPStatus.HEALTHY,
                last_health_check=datetime.utcnow()
            )
        ]
        
        for mcp in builtin_mcps:
            self.registry[mcp.id] = mcp
    
    async def _load_user_mcps(self):
        """Load user-owned MCPs from HF Spaces"""
        try:
            # Get all users
            users = await self.auth_service.get_all_users()
            
            for user in users:
                # Discover user's MCPs
                user_mcps = await self.discover_user_mcps(user.id)
                
                for mcp in user_mcps:
                    self.registry[mcp.id] = mcp
                    
        except Exception as e:
            logger.error(f"Error loading user MCPs: {str(e)}")
    
    async def get_mcps_for_task(self, task_type: str, user_id: str) -> List[MCPInfo]:
        """Get MCPs that can handle a specific task type"""
        try:
            # Get all MCPs for this task type
            suitable_mcps = [
                mcp for mcp in self.registry.values()
                if task_type in mcp.supported_task_types
            ]
            
            # Filter by user permissions
            user_mcps = []
            for mcp in suitable_mcps:
                if await self._user_can_access_mcp(user_id, mcp):
                    user_mcps.append(mcp)
            
            # Sort by health and priority
            user_mcps.sort(key=lambda x: (
                x.status.value,  # Healthier first
                -x.routing_flags.can_run_on_user_space,  # Prefer user space for heavy tasks
                x.last_health_check.timestamp()  # Recently checked first
            ))
            
            return user_mcps
            
        except Exception as e:
            logger.error(f"Error getting MCPs for task: {str(e)}")
            return []
    
    async def discover_user_mcps(self, user_id: str) -> List[MCPInfo]:
        """Discover MCPs in user's HF Space"""
        try:
            # Get user's HF Spaces
            spaces = await self.hf_service.get_user_spaces(user_id)
            
            user_mcps = []
            for space in spaces:
                # Check if space contains MCP
                mcp_info = await self._check_space_for_mcp(space)
                if mcp_info:
                    user_mcps.append(mcp_info)
            
            return user_mcps
            
        except Exception as e:
            logger.error(f"Error discovering user MCPs: {str(e)}")
            return []
    
    async def _check_space_for_mcp(self, space: Dict[str, Any]) -> Optional[MCPInfo]:
        """Check if HF Space contains an MCP"""
        try:
            # Check for MCP manifest
            manifest_url = f"{space['url']}/mcp.json"
            async with httpx.AsyncClient() as client:
                response = await client.get(manifest_url)
                if response.status_code == 200:
                    manifest = response.json()
                    
                    # Create MCP info
                    mcp_info = MCPInfo(
                        id=f"{space['owner']}-{space['name']}",
                        name=manifest.get('name', space['name']),
                        url=space['url'],
                        capabilities=self._parse_capabilities(manifest),
                        supported_task_types=self._parse_task_types(manifest),
                        routing_flags=self._parse_routing_flags(manifest),
                        status=MCPStatus.UNKNOWN,
                        last_health_check=datetime.utcnow()
                    )
                    
                    return mcp_info
            
            return None
            
        except Exception as e:
            logger.error(f"Error checking space for MCP: {str(e)}")
            return None
    
    def _parse_capabilities(self, manifest: Dict[str, Any]) -> List[Capability]:
        """Parse capabilities from MCP manifest"""
        capabilities = []
        
        if 'tools' in manifest:
            for tool in manifest['tools']:
                capability = Capability(
                    name=tool.get('name', ''),
                    version=tool.get('version', '1.0.0'),
                    parameters=set(tool.get('parameters', []))
                )
                capabilities.append(capability)
        
        return capabilities
    
    def _parse_task_types(self, manifest: Dict[str, Any]) -> List[str]:
        """Parse supported task types from MCP manifest"""
        task_types = []
        
        if 'capabilities' in manifest:
            for cap in manifest['capabilities']:
                task_types.extend(cap.get('task_types', []))
        
        return task_types
    
    def _parse_routing_flags(self, manifest: Dict[str, Any]) -> RoutingFlags:
        """Parse routing flags from MCP manifest"""
        return RoutingFlags(
            can_run_on_user_space=manifest.get('can_run_on_user_space', False),
            result_pointer_preferred=manifest.get('result_pointer_preferred', False),
            fallback_to_oracle=manifest.get('fallback_to_oracle', True)
        )
    
    async def update_mcp_status(self, mcp_id: str, status: MCPStatus):
        """Update MCP status"""
        try:
            if mcp_id in self.registry:
                self.registry[mcp_id].status = status
                self.registry[mcp_id].last_health_check = datetime.utcnow()
                
                # Update health cache
                self.health_cache[mcp_id] = {
                    'status': status,
                    'timestamp': datetime.utcnow()
                }
                
        except Exception as e:
            logger.error(f"Error updating MCP status: {str(e)}")
    
    async def validate_mcp_health(self, mcp_id: str) -> MCPStatus:
        """Check MCP health and return status"""
        try:
            # Check cache first
            if mcp_id in self.health_cache:
                cached = self.health_cache[mcp_id]
                if datetime.utcnow() - cached['timestamp'] < self.health_cache_ttl:
                    return cached['status']
            
            # Get MCP info
            mcp = self.registry.get(mcp_id)
            if not mcp:
                return MCPStatus.UNKNOWN
            
            # Perform health check
            status = await self._perform_health_check(mcp)
            
            # Update cache
            self.health_cache[mcp_id] = {
                'status': status,
                'timestamp': datetime.utcnow()
            }
            
            # Update registry
            await self.update_mcp_status(mcp_id, status)
            
            return status
            
        except Exception as e:
            logger.error(f"Error validating MCP health: {str(e)}")
            return MCPStatus.UNHEALTHY
    
    async def _perform_health_check(self, mcp: MCPInfo) -> MCPStatus:
        """Perform actual health check on MCP"""
        try:
            # Check if MCP is accessible
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{mcp.url}/health",
                    timeout=10
                )
                
                if response.status_code == 200:
                    health_data = response.json()
                    
                    # Check specific health indicators
                    if health_data.get('status') == 'healthy':
                        return MCPStatus.HEALTHY
                    elif health_data.get('status') == 'warning':
                        return MCPStatus.WARNING
                    else:
                        return MCPStatus.UNHEALTHY
                else:
                    return MCPStatus.UNHEALTHY
                    
        except Exception as e:
            logger.error(f"Error performing health check on {mcp.id}: {str(e)}")
            return MCPStatus.UNHEALTHY
    
    async def _user_can_access_mcp(self, user_id: str, mcp: MCPInfo) -> bool:
        """Check if user can access MCP"""
        try:
            # For now, allow all users to access all MCPs
            # In the future, this could check user permissions, subscriptions, etc.
            return True
            
        except Exception as e:
            logger.error(f"Error checking user access to MCP: {str(e)}")
            return False
    
    async def get_mcp_info(self, mcp_id: str) -> Optional[MCPInfo]:
        """Get MCP information by ID"""
        return self.registry.get(mcp_id)
    
    async def list_mcps(self, user_id: Optional[str] = None) -> List[MCPInfo]:
        """List all MCPs, optionally filtered by user"""
        try:
            if user_id:
                return [
                    mcp for mcp in self.registry.values()
                    if await self._user_can_access_mcp(user_id, mcp)
                ]
            else:
                return list(self.registry.values())
                
        except Exception as e:
            logger.error(f"Error listing MCPs: {str(e)}")
            return []