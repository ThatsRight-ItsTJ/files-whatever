# MCP Configuration

MCP configuration is managed via `mcp-config.json` (per-server) and the global `metamcp_registry.json` in the orchestrator. This section explains how to configure MCPs for deployment, routing flags, and integration. Configuration ensures MCPs are discoverable, secure, and optimized for the split-processing model.

From mcp-config.json and clone report, configs include auth, endpoints, and flags for registry.

## mcp-config.json

Per-MCP config file, placed in the MCP root or HF Space secrets. Defines server settings, auth, and defaults.

Example for a custom MCP:
```json
{
  "server": {
    "name": "my-custom-mcp",
    "version": "1.0.0",
    "host": "0.0.0.0",
    "port": 7860,
    "debug": false,
    "log_level": "INFO"
  },
  "auth": {
    "type": "hf_token",
    "token": "${HF_TOKEN}",  # From env/secrets
    "jwt_secret": "mcp-jwt-secret"  # For internal signing
  },
  "tools": {
    "default_timeout": 300,
    "max_concurrent": 5
  },
  "hf_space": {
    "dataset_repo": "user/kg-datasets",
    "upload_token": "${HF_TOKEN}"
  },
  "routing_flags": {
    "can_run_on_user_space": true,
    "result_pointer_preferred": true,
    "fallback_to_oracle": false
  }
}
```

Key Sections:
- **server**: Name, version, host/port for FastAPI.
- **auth**: Type (hf_token, jwt), secrets for verification.
- **tools**: Timeouts, concurrency limits.
- **hf_space**: Dataset repo for pointers.
- **routing_flags**: For registry (see [MCP Registry](../architecture/mcp-registry.md)).

Load in main.py:
```python
import json
with open("mcp-config.json") as f:
    config = json.load(f)
app = FastAPI(**config["server"])
```

## Registry Integration

Global config in `orchestrator/config/metamcp_registry.json` aggregates MCPs.

Example entry:
```json
{
  "mcps": [
    {
      "id": "libraries-io",
      "name": "Libraries.io MCP",
      "url": "https://hf.co/spaces/user/libraries-io",
      "mcp_config": "mcp-config.json",  # Relative or absolute
      "capabilities": ["package_discovery", "dependency_analysis"],
      "routing_flags": {
        "can_run_on_user_space": true,
        "result_pointer_preferred": false,
        "fallback_to_oracle": true
      },
      "health_check": {
        "endpoint": "/health",
        "interval": 30
      }
    }
  ]
}
```

- **mcp_config**: Path to per-MCP config (fetched on probe).
- **routing_flags**: Controls orchestrator behavior (user space preference, pointers).
- **health_check**: Probe settings.

Update registry after deployment; backend loads on startup, caches in Redis.

## Environment Variables

For HF Spaces, use secrets instead of files.

Example .env in template:
```
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LIBRARIES_IO_API_KEY=your-libraries-key
DEBUG=false
LOG_LEVEL=INFO
MAX_CONCURRENT_JOBS=5
```

In main.py:
```python
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()
app.add_middleware(...)
# Use os.getenv("HF_TOKEN")
```

For production: Set in HF UI secrets; avoid committing keys.

## Security Configuration

- **Job Signing**: Use JWT_SECRET for RS256 verification (from artifacts).
- **Rate Limiting**: Per-tool limits in config.
- **CORS**: Set in FastAPI for frontend origins.
- **Secrets**: Never hardcode; use env/secrets.

Example middleware:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Best Practices

- **Validation**: Use Pydantic for tool inputs in mcp.json schemas.
- **Logging**: Structlog for JSON logs; include mcp_id, tool.
- **Health**: Always implement /health returning {"status": "healthy", "version": "1.0"}.
- **Pointers**: For >1MB results, upload to HF Dataset, return pointer.
- **Updates**: Version in config; orchestrator probes for changes.

For development: [MCP Development](../developer/mcp-development.md). Examples: [Custom MCPs](custom-mcps.md).

Back to [MCP Servers](index.md).