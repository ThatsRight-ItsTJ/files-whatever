## Deployment notes for HF Space Worker Template

- Create a new HuggingFace Space (or use an existing one) and push the contents of the `worker/` directory.
- Configure HF Space secrets / environment variables:
  - `HF_TOKEN` - your HuggingFace token with repo/dataset write access
  - `META_PUBLIC_KEY` - MetaMCP public key (PEM format) used to verify signed jobs
  - `WORKER_ID` - optional human-friendly worker id
  - `DEFAULT_HF_REPO` - optional default dataset repo id where artifacts are uploaded (e.g. `username/repo-datasets`)
- Ensure `git` is available in the Space runtime. The provided Dockerfile installs `git`.
- The worker will expose the following HTTP endpoints:
  - `GET /mcp/health` - health check
  - `GET /mcp/capabilities` - capabilities probe
  - `POST /mcp/exec` - accept a JSON payload `{ "envelope_jwt": "..." }` with signed job
- The worker will upload artifacts to the HF dataset specified by `hf_repo` in the job payload or `DEFAULT_HF_REPO`.

Security & notes:
- The worker verifies the JWT using the `META_PUBLIC_KEY`. MetaMCP should sign job envelopes with its private key.
- The worker will run commands like `git clone`, `semgrep` and simple kglab/rdflib ingestion. Review & harden before use.
