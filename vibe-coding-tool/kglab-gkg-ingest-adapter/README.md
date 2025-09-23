# kglab GKG Ingestion Adapter (FastAPI)

Small MCP-style HTTP wrapper that ingests documents/URLs into a Knowledge Graph using kglab (with rdflib fallback),
exposes simple tools for ingestion, querying (SPARQL), export, and stats.

## Features (scaffold)
- `POST /mcp/ingest_url` - fetch a URL and ingest its text into the graph
- `POST /mcp/ingest_text` - ingest raw text into the graph
- `POST /mcp/query` - run a SPARQL query against the graph
- `GET  /mcp/export_graph` - export graph in TTL/JSON-LD/N-Triples formats
- `GET  /mcp/stats` - return basic graph stats (triples count, namespaces)

This is a scaffold intended for extension: entity extraction, relation extraction, deduplication,
and advanced KG alignment are left as extension points.

## Quickstart (development)
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GITHUB_TOKEN="ghp_xxx"  # if you plan to also pull docs with GitHub token
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## Example: ingest URL
```bash
curl -X POST http://localhost:8080/mcp/ingest_url -H "Content-Type: application/json" -d '{
  "url": "https://example.com/article",
  "source_name": "example_article",
  "graph": "default"
}'
```

## Notes
- The scaffold attempts to use `kglab` if installed; otherwise it uses `rdflib` directly.
- For production: add authentication, persistent storage (S3/R2), job queueing, entity extraction pipelines (spaCy / HF), and versioning.
