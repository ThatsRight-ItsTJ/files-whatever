## Deployment notes

- The adapter will try to import `kglab`. If kglab is installed, the adapter will create a `kglab.KnowledgeGraph` object per named graph. Otherwise it uses rdflib.Graph as a fallback.
- For production, consider:
  - Using a persistent triplestore or vector DB for larger graphs (Blazegraph, GraphDB, AllegroGraph, Neptune, or Postgres+PGGraph/JSONB). 
  - Adding authentication and an API key layer.
  - Using background job queue (Redis + RQ) for heavy ingestion.
  - Adding entity/relation extraction pipelines (spaCy, HuggingFace models), deduplication, canonicalization.
- To deploy to Vercel: create a project, set `DATA_DIR` env var if needed, set build command `pip install -r requirements.txt` and start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
