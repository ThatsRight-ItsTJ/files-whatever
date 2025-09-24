# Hugging Face Integration

The Vibe Coding Tool integrates with Hugging Face for deploying MCPs to Spaces, storing knowledge graphs in Datasets, and model inference. This enables user-owned heavy compute (e.g., Semgrep in Space) and persistent data storage. Uses OAuth for auth and the Hugging Face API via the backend HFService.

From the backend plan, HFService handles Space deployment, dataset upload, and KG queries.

## Setup

1. **Hugging Face App**:
   - Go to Hugging Face Settings > Applications > New App.
   - App Name: "Vibe Coding Tool".
   - Redirect URL: http://localhost:3000/auth/huggingface/callback (dev) or https://yourdomain.com/auth/huggingface/callback (prod).
   - Scopes: Read/write for Spaces, Datasets, Models.
   - Note Client ID and Secret.

2. **Configure in Vibe**:
   - Add to .env:
     ```
     HF_CLIENT_ID=your-client-id
     HF_CLIENT_SECRET=your-client-secret
     HF_REDIRECT_URI=http://localhost:3000/auth/huggingface/callback
     ```
   - Restart backend/frontend.

3. **Link Account**:
   - In app: Dashboard > Settings > "Connect Hugging Face".
   - Or API: POST /api/user/link-account {provider: "huggingface", code: "from-oauth"}.
   - Grant permissions; backend stores token.

## Features

- **Space Deployment**: Auto-deploy MCPs to your Spaces for heavy tasks.
- **Dataset Storage**: Upload KG exports, large results as Datasets.
- **Model Inference**: Query models via MCPs (e.g., for AI tasks).
- **Discovery**: List your Spaces for MCP registration.

Powered by HF API for Spaces/Datasets.

## Usage

### Deploy MCP Space
- In UI: Dashboard > MCPs > "Deploy New MCP" > Select template (e.g., Semgrep).
- Backend calls HFService.deploy_space(template).
- Progress: 2-3 minutes; URL added to registry.
- Manual API: POST /api/integrations/huggingface/deploy {template: "semgrep"} → space_url.

Example Response:
```json
{
  "space_url": "https://hf.co/spaces/user/semgrep-mcp",
  "status": "deployed"
}
```

### Upload Dataset (e.g., KG Export)
- In UI: KG tab > "Export to HF Dataset".
- Backend: HFService.upload_dataset(data, repo="user/kg-datasets").
- Result: Pointer {"type": "hf_dataset", "location": "hf://user/kg-datasets/project1"}.

Example API:
```
POST /api/kg/export
{
  "project_id": "proj_123",
  "data": {"nodes": [...], "edges": [...]}
}
```
Response: {"dataset_url": "https://hf.co/datasets/user/kg-datasets", "pointer": "hf://user/kg-datasets/proj1"}.

### Query Models
- For AI MCPs: Tasks route to HF-hosted models (e.g., Your-PaL-MoE).
- Manual: Task "Model Inference" > Select model from Space.

### List Spaces
- UI: Settings > "My HF Spaces" – lists for MCP selection.
- API: GET /api/integrations/huggingface/spaces → list[Space].

## Troubleshooting

- **Auth Errors**: Invalid scopes? Re-authorize with Spaces/Datasets access.
- **Deployment Fails**: Check HF token (write permissions), network. Logs in HF UI.
- **Rate Limits**: HF API limits; tool retries.
- **Private Spaces**: Token must have access; public for testing.

For custom HF wrappers: See [Extending](../developer/extending.md#custom-integrations).

Back to [Integrations](index.md).