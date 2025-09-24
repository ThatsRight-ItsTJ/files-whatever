# Extending the System

The Vibe Coding Tool is designed for extensibility, allowing developers to add new MCPs, custom integrations, and plugins without core changes. This guide covers how to extend the system, focusing on MCP addition, third-party integrations, and plugin architecture. References: [MCP Development](mcp-development.md), [Integrations](../integrations/index.md).

## Adding New MCPs

Extend capabilities by creating and integrating custom MCPs.

### Steps:
1. **Create MCP**:
   - Follow [MCP Development](mcp-development.md): Use HF template, define tools in mcp.json, implement in main.py.

2. **Deploy**:
   - To HF Space for heavy, or oracle for light (Docker on VPS).
   - Test locally: `docker run -p 7860:7860 my-mcp`.

3. **Integrate with Orchestrator**:
   - Update `orchestrator/config/metamcp_registry.json`:
     ```json
     {
       "id": "new-mcp",
       "name": "New MCP",
       "url": "https://hf.co/spaces/user/new-mcp",
       "capabilities": ["new_tool"],
       "can_run_on_user_space": true,
       "result_pointer_preferred": false,
       "fallback_to_oracle": true
     }
     ```
   - Restart backend: `docker compose restart app`.
   - Probe: Backend auto-discovers on health check; manual POST /api/mcps/probe.

4. **Frontend Exposure**:
   - Add to agent marketplace: New template in `components/agents/AgentMarketplace.tsx`.
   - Or task selector: Update tools list in dashboard.

5. **Testing**:
   - Create task requiring "new_tool": Verify routing in logs.
   - E2E: Playwright test for UI flow.

Example: Add "Database MCP" for SQL ops – deploy, add to registry, use in workflows.

## Custom Integrations

Add support for new services (e.g., GitLab instead of GitHub).

### Steps:
1. **Backend Service**:
   - Create `services/gitlab_service.py` similar to GitHubService.
     ```python
     class GitLabService:
         async def create_repo(self, spec: RepoSpec) -> Repository:
             resp = await self.client.post("/projects", json=spec.dict())
             return Repository.from_response(resp)
     ```
   - Add to core/job_manager.py for routing.

2. **API Endpoint**:
   - New router in `api/integrations.py`: POST /api/integrations/gitlab/setup.
   - OAuth flow: Extend auth_service.py.

3. **Frontend**:
   - Add provider in NextAuth config (`app/api/auth/[...nextauth]/route.ts`).
   - UI: New option in login, project wizard.

4. **Registry Update**:
   - If MCP wrapper, add as lightweight in registry.

5. **Testing**:
   - Unit: Mock GitLab API.
   - Integration: Test OAuth, repo creation.

Example: Cloudflare integration from cloudflare-mcps – wrap API, add service.

## Plugin Architecture

The system supports plugins for agents, editors, visualizations.

### Agent Plugins
- **Templates**: Store in DB (agent_templates table).
  - Create: POST /api/agents/custom {template: json}.
  - UI: Marketplace fetches from /api/agents/templates.
  - Extend: New agent type in frontend, route to custom MCP.

### Editor Plugins
- Monaco extensions: Add language servers via MCP (e.g., Tree-sitter for parsing).
  - Integrate: In CodeEditor.tsx, load from MCP /language-support.

### Visualization Plugins
- KG: Extend Cytoscape with custom layouts (graphLayout.ts).
  - New viz: Add tab in AppShell, query backend /api/kg/visualize?type=new.

### Implementation
- **Hooks**: Use backend registry for dynamic loading.
- **Security**: Validate plugins via signed manifests (from job_signing_samples).
- **Distribution**: Share via HF Datasets or GitHub; users import via UI.

Example: Plugin for VS Code-like extensions – MCP for linting, frontend loader.

For deployment of extensions: [Deployment](../deployment/index.md). Contribute: [Contributing](../contributing/index.md).

Back to [Developer Docs](index.md).