# GitHub-File-Seek MCP Wrapper (FastAPI)

Small MCP-style HTTP wrapper around the GitHub API that provides two endpoints:

- `POST /mcp/find_files` - find files in a repo (glob or regex)
- `POST /mcp/download_files` - download matched files as a ZIP archive

## Quickstart (development)
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GITHUB_TOKEN="ghp_xxx"  # or set in deployment secrets
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## API examples
### Find files
```bash
curl -X POST http://localhost:8080/mcp/find_files -H "Content-Type: application/json" -d '{
  "repo": "owner/repo",
  "branch": "main",
  "pattern": "**/*.py",
  "mode": "glob"
}'
```

### Download files (returns a ZIP)
```bash
curl -X POST http://localhost:8080/mcp/download_files -H "Content-Type: application/json" -d '{
  "repo": "owner/repo",
  "branch": "main",
  "paths": ["src/app.py", "README.md"]
}' --output files.zip
```

## mcp.json (included)
This repo includes `mcp.json` as a minimal MCP manifest for HTTP-based MCP servers.
