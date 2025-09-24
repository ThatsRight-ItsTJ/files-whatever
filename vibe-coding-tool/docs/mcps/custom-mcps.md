# Custom MCPs

Custom MCPs are user-developed servers tailored for specific needs, such as dependency analysis or AI model orchestration. The Vibe Coding Tool includes examples like Libraries.io for package ecosystems and Your-PaL-MoE for multi-provider AI. These are cloned from the repo and deployed to HF Spaces, adding to the registry for task routing.

From the clone report, custom MCPs are in `custom-mcps/`: libraries-io-mcp-server (dependency insights), Your-PaL-MoE-v0.3 (AI proxy).

## Libraries.io MCP Server

**Description**: Full MCP for package discovery, dependency analysis, and ecosystem insights. Wraps Libraries.io API to scan dependencies, suggest updates, and analyze vulnerabilities across ecosystems (npm, PyPI, etc.).

**Capabilities**:
- "package_discovery": Search packages by name/language.
- "dependency_analysis": Scan repo for deps, check vulnerabilities.
- "ecosystem_insights": Get trends, alternatives for packages.

**Deployment**:
1. Clone: `git clone https://github.com/ThatsRight-ItsTJ/libraries-io-mcp-server custom-mcps/libraries-io`.
2. Setup: Edit .env with LIBRARIES_IO_API_KEY (from libraries.io).
3. Requirements: Includes fastapi, httpx, mcp-sdk.
4. Run locally: `cd src && uvicorn libraries_io_mcp.server:app --reload`.
5. Docker: `docker build -t libraries-io-mcp . && docker run -p 8000:8000 libraries-io-mcp`.
6. HF Space: Push to Space as in [HF Spaces](../deployment/hf-spaces.md); add API key in secrets.

**mcp.json Example** (Adapted):
```json
{
  "tools": {
    "search_packages": {
      "name": "search_packages",
      "description": "Search packages in ecosystem",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {"type": "string"},
          "platform": {"type": "string", "default": "npm"}
        }
      }
    },
    "analyze_dependencies": {
      "name": "analyze_dependencies",
      "description": "Analyze project dependencies",
      "inputSchema": {
        "type": "object",
        "properties": {
          "repo_url": {"type": "string"},
          "platform": {"type": "string"}
        }
      }
    }
  }
}
```

**Usage**:
- Task: "Analyze dependencies" – input repo_url, gets JSON with deps, vulnerabilities, updates.
- Integration: In workflows, route to this MCP for "dependency scan" tasks.
- Results: JSON with packages, versions, security alerts; pointer for large reports.

**Health**: /health returns API status.

## Your-PaL-MoE MCP

**Description**: AI model orchestration proxy supporting multiple providers (OpenAI, Claude, OpenRouter). Routes requests to best model, handles auth, and provides unified interface for AI tasks like code gen.

**Capabilities**:
- "ai_complete": Completion with models (GPT-4, Claude-3).
- "model_discovery": List available models across providers.
- "provider_proxy": Route to specific provider.

**Deployment**:
1. Clone: `git clone https://github.com/ThatsRight-ItsTJ/Your-PaL-MoE-v0.3 custom-mcps/Your-PaL-MoE`.
2. Config: Edit config/providers.json with API keys (OpenAI, Claude).
   ```
   {
     "providers": {
       "openai": {"api_key": "sk-...", "base_url": "https://api.openai.com/v1"},
       "claude": {"api_key": "claude-key", "base_url": "https://api.anthropic.com"}
     }
   }
   ```
3. Requirements: Includes fastapi, httpx, mcp-sdk, openai, anthropic.
4. Run locally: `node index.js` or Python wrapper if available.
5. Docker: Build from Dockerfile, run with env vars for keys.
6. HF Space: Push code, set secrets for API keys.

**mcp.json Example**:
```json
{
  "tools": {
    "ai_complete": {
      "name": "ai_complete",
      "description": "AI completion via MoE",
      "inputSchema": {
        "type": "object",
        "properties": {
          "prompt": {"type": "string"},
          "model": {"type": "string", "default": "gpt-4"}
        }
      }
    }
  }
}
```

**Usage**:
- Task: "Generate code" – input prompt, model; routes to provider, returns completion.
- Integration: Use in AI agents for dynamic model selection.
- Results: Streamed text; supports multi-modal (text/code).

**Health**: /health returns available models/providers.

These custom MCPs enhance the tool for deps and AI. For community: [Community MCPs](community-mcps.md). Config: [Configuration](configuration.md).

Back to [MCP Servers](index.md).