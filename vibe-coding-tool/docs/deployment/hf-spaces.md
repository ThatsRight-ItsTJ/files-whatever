# HF Spaces Deployment for MCPs

Hugging Face Spaces provide a scalable, user-owned environment for heavy MCPs (e.g., Semgrep, kglab GKG). This guide details deploying MCPs to Spaces using the provided template, configuring for production, and integrating with the orchestrator. Spaces handle GPU/CPU for intensive tasks, keeping data private.

Prerequisites: HF account, huggingface_hub CLI installed (`pip install huggingface_hub`), Docker for building.

## Why HF Spaces?

- **Scalability**: Auto-scale based on CPU/GPU needs.
- **Privacy**: Runs in your account; no data to central servers.
- **Integration**: Auto-discovered by orchestrator via registry.
- **Cost**: Free tier for basic; pay for GPU.

From clone report: Template supports signed jobs, probes, pointers.

## Deploying MCP to HF Space

1. **Prepare MCP Code**:
   - Use [MCP Development](../developer/mcp-development.md): Clone template, implement tools.
   - Edit `worker/mcp.json`: Add capabilities (e.g., "code_analysis").
   - Test locally: `docker build -t mcp-worker . && docker run -p 7860:7860 mcp-worker`.

2. **Build Docker Image**:
   ```
   cd hfspace-worker-template/worker
   docker build -t your-username/mcp-worker:latest .
   docker tag your-username/mcp-worker:latest your-username/mcp-worker:v1.0
   docker push your-username/mcp-worker:latest  # To Docker Hub or HF Container Registry
   ```

3. **Create Space via HF CLI**:
   ```
   huggingface-cli login  # Login with token
   huggingface-cli repo create your-mcp-space --type space --private
   ```
   - Or UI: New Space > From Dockerfile (upload Dockerfile, mcp.json, main.py).

4. **Configure Space**:
   - **Hardware**: CPU Basic (free), GPU T4 for heavy (pay).
   - **Secrets**: In Space Settings > Secrets:
     - HF_TOKEN: Your HF token (read/write for datasets).
     - API keys for tools (e.g., SEMGREP_TOKEN).
   - **Variables**: HF_TOKEN for auth.
   - **Dockerfile**: Ensure exposes port 7860, runs uvicorn main:app --host 0.0.0.0 --port 7860.

5. **Push Code**:
   ```
   git init
   git add .
   git commit -m "Initial MCP"
   git remote add origin https://huggingface.co/spaces/your-username/your-mcp-space
   git push -u origin main
   ```
   - HF builds and deploys (logs in UI).

6. **Verify Deployment**:
   - Space URL: https://huggingface.co/spaces/your-username/your-mcp-space.
   - Health: curl https://your-username-your-mcp-space.hf.space/health → {"status": "healthy"}.
   - Capabilities: curl -X POST https://your-username-your-mcp-space.hf.space/capabilities → tools list.

## Integration with Vibe Coding Tool

1. **Update Registry**:
   - In orchestrator config/metamcp_registry.json:
     ```json
     {
       "id": "my-mcp",
       "url": "https://your-username-your-mcp-space.hf.space",
       "capabilities": ["my_tool"],
       "can_run_on_user_space": true,
       "result_pointer_preferred": true,
       "health_endpoint": "/health"
     }
     ```
   - Restart orchestrator: Probe auto-adds on health check.

2. **User-Specific Spaces**:
   - On user auth, backend deploys per-user Space using template.
   - Registry updates with user_space_url.

3. **Advanced Config**:
   - **Hardware Scaling**: Upgrade in HF UI for GPU.
   - **Environment**: Add .env.example vars (e.g., API keys).
   - **Callbacks**: For long-running, implement /callback endpoint in main.py.
   - **Job Signing**: Template includes verification; ensure keys in secrets.

## Example: Deploy Semgrep MCP

1. Clone template, add Semgrep in requirements.txt: semgrep==1.0.
2. main.py tool:
   ```python
   @mcp.tool()
   async def semgrep_scan(files: list, rules: str = "security") -> dict:
       from semgrep import cli
       result = cli.invoke_scan(files, rules)
       return {"issues": result.json()}
   ```
3. mcp.json: "capabilities": ["code_analysis"].
4. Build/push/deploy as above.
5. Use in task: "Run Semgrep on repo" – routes to Space.

## Troubleshooting

- **Build Fails**: Check Dockerfile, requirements.txt; HF logs in UI.
- **Health 500**: Verify port 7860, env vars (HF_TOKEN).
- **Slow Startup**: HF cold starts ~1min; use persistent hardware.
- **Costs**: Monitor HF dashboard; free tier limits runtime.

For CI/CD: [CI/CD](ci-cd.md). Custom MCPs: [MCP Development](../developer/mcp-development.md).

Back to [Deployment Index](index.md).