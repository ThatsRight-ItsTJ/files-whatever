# MCP Server Development

This guide explains how to create custom Model Context Protocol (MCP) servers for the Vibe Coding Tool. MCPs extend the system with specialized capabilities (e.g., code analysis, deployment). Focus on using the HF Space Worker Template for heavy compute, integrating with the orchestrator registry, and deploying to Hugging Face Spaces. References: mcp-config.json, clone report, and [MCP Registry](../architecture/mcp-registry.md).

## Creating Custom MCPs

MCPs are FastAPI servers exposing tools via /tools and /execute endpoints, per MCP spec. Use Python for consistency with backend.

### 1. Use HF Space Worker Template

The template provides a scaffold for HF Spaces with job verification, capability probes, and pointer results.

1. **Clone Template**:
   ```
   cd vibe-coding-tool
   cp -r hfspace-worker-template/worker my-custom-mcp
   cd my-custom-mcp
   ```

2. **Edit mcp.json** (Manifest):
   ```json
   {
     "mcpServers": {
       "my-custom-mcp": {
         "name": "My Custom MCP",
         "version": "1.0.0",
         "capabilities": ["custom_tool"],
         "transport": "streamable-http",
         "host": "0.0.0.0",
         "port": 7860
       }
     },
     "tools": {
       "custom_tool": {
         "name": "custom_tool",
         "description": "My custom tool",
         "inputSchema": {
           "type": "object",
           "properties": {
             "input": {"type": "string"}
           }
         }
       }
     }
   }
   ```
   - Add tools with schemas; match capabilities for registry.

3. **Implement Tools** (`main.py`):
   ```python
   from fastapi import FastAPI
   from mcp.server.fastmcp import FastMCP
   import uvicorn

   app = FastAPI()
   mcp = FastMCP(app, name="my-custom-mcp")

   @mcp.tool()
   async def custom_tool(input: str) -> str:
       """Execute custom logic"""
       # e.g., Analyze input with libraries.io API
       result = f"Processed: {input}"
       return result  # Or pointer for large

   if __name__ == "__main__":
       uvicorn.run(app, host="0.0.0.0", port=7860)
   ```

4. **Requirements** (`requirements.txt`):
   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   mcp-python-sdk  # For MCP protocol
   # Add domain libs, e.g., librariesio-client
   ```

5. **Dockerfile** (For HF):
   ```
   FROM python:3.11-slim
   WORKDIR /app
   COPY . .
   RUN pip install -r requirements.txt
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
   ```

### 2. Integration with Orchestrator

1. **Capability Probe**:
   - Implement /capabilities endpoint to return tools from mcp.json.
   - Backend probes on discovery.

2. **Job Signing Verification**:
   - Use artifacts/job_signing_samples/python_verify_job.py.
   - In main.py:
     ```python
     from job_signing_samples.python_verify_job import verify_job

     @app.post("/execute")
     async def execute_job(request: dict):
         if not verify_job(request):
             raise HTTPException(401, "Invalid signature")
         tool = request["tool"]
         args = request["arguments"]
         result = await globals()[tool](**args)
         return {"result": result}
     ```

3. **Pointer Results**:
   - For large outputs, upload to HF Dataset, return pointer.
   - Backend resolves in ResultManager.

4. **Add to Registry**:
   - After deployment, update metamcp_registry.json:
     ```json
     {
       "id": "my-custom-mcp",
       "url": "https://hf.co/spaces/user/my-custom-mcp",
       "capabilities": ["custom_tool"],
       "can_run_on_user_space": true,
       "result_pointer_preferred": true
     }
     ```
   - Restart orchestrator; probe health.

## Deployment to HF Spaces

1. **Prepare**:
   - Edit .env in template with HF_TOKEN.
   - Test locally: `docker build -t my-mcp . && docker run -p 7860:7860 my-mcp`.

2. **Deploy via HF CLI**:
   ```
   huggingface-cli login  # With your token
   huggingface-cli repo create my-custom-mcp --private
   git remote add hf https://huggingface.co/spaces/user/my-custom-mcp
   git push hf main
   ```
   - HF builds Docker, deploys Space.

3. **Configure Space**:
   - In HF UI: Set hardware (CPU basic, GPU for heavy).
   - Secrets: Add HF_TOKEN, API keys.
   - README_DEPLOY.md: Follow for customizations.

4. **Verify**:
   - Space URL: https://huggingface.co/spaces/user/my-custom-mcp.
   - Test /health, /capabilities.
   - Integrate: Use in task (e.g., "Run custom_tool").

From clone report: Examples like libraries-io-mcp-server (full server with tests/docs), seeding-orchestrator-mcp (multi-backend).

## Testing MCPs

1. **Unit Tests**:
   - Pytest for tools: `pytest tests/test_tools.py`.
   - Mock inputs, verify outputs/pointers.

2. **Integration**:
   - Test with orchestrator: Create task requiring capability, check routing/result.
   - Use mcp-python-sdk examples/clients/simple-chatbot for client testing.

3. **Load/Health**:
   - Locust for concurrency.
   - Probe: curl /health should 200.

For extending: [Extending the System](extending.md). Examples: [Custom MCPs](../mcps/custom-mcps.md).

Back to [Developer Docs](index.md).