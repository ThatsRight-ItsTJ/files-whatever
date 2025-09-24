# Cloudflare Integration

The Vibe Coding Tool integrates with Cloudflare for edge computing, DNS management, KV storage, and Workers deployment. This enables fast, secure edge tasks like DNS updates or serverless functions. Uses the Cloudflare API via a backend service or MCP wrapper from cloudflare-mcps.

From the clone report, cloudflare-mcps provides wrappers for DNS, KV, R2, Workers.

## Setup

1. **Cloudflare Account**:
   - Sign up at cloudflare.com.
   - Create API token: Dashboard > API Tokens > Create Token.
     - Permissions: Zone:Read, Zone:Edit, Workers:Edit (for full).
     - Resources: Include your zones.
   - Note API Token (preferred over key for security).

2. **Configure in Vibe**:
   - Add to .env:
     ```
     CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
     CLOUDFLARE_ZONE_ID=your-zone-id  # For specific domain
     ```
   - Restart backend.

3. **Link Account** (Optional for MCP):
   - If using OAuth (future), add provider in auth.
   - For API: Token stored in user profile or .env for global.

## Features

- **DNS Management**: Add/update DNS records.
- **KV Storage**: Store/retrieve key-value data at edge.
- **R2 Storage**: Object storage for large files/results.
- **Workers Deployment**: Deploy serverless functions via MCP.

Powered by Cloudflare MCP wrapper for edge tasks.

## Usage

### DNS Management
- UI: Dashboard > Tools > "Manage DNS" > Select zone, add record (A, CNAME).
- Backend calls CloudflareService.update_dns(record).
- Example API (if exposed):
  ```
  POST /api/integrations/cloudflare/dns
  {
    "zone_id": "zone123",
    "record": {
      "type": "A",
      "name": "app.example.com",
      "value": "192.0.2.1",
      "ttl": 3600
    }
  }
  ```
- Result: Record added; verify in Cloudflare dashboard.

### KV Storage
- For caching results at edge.
- Task: "Store KV" – input key, value; routes to KV MCP.
- Example: Store KG pointer in KV for fast retrieval.
- API: POST /api/integrations/cloudflare/kv {key, value} → success.

### R2 Storage
- For large files (alternative to HF Datasets).
- Upload via service: POST /api/integrations/cloudflare/r2/upload {file}.
- Result: Public URL for pointer.

### Workers Integration
- Deploy function: Task "Deploy Worker" – code to Cloudflare Workers.
- MCP wrapper handles API calls.

## Troubleshooting

- **Auth Errors**: Invalid token? Regenerate with correct permissions.
- **Zone Not Found**: Verify ZONE_ID matches your domain.
- **Rate Limits**: Cloudflare API limits; tool retries.
- **MCP Wrapper**: If using, deploy from cloudflare-mcps, add to registry.

For custom Cloudflare MCPs: See [Extending](../developer/extending.md#custom-integrations).

Back to [Integrations](index.md).