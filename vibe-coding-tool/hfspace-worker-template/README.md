# HF Space Worker Template for MetaMCP

This is a HuggingFace Space-compatible worker template that:
- Implements minimal MCP endpoints: `/mcp/health`, `/mcp/capabilities`, `/mcp/exec`
- Verifies signed job envelopes (JWT RS256) using MetaMCP public key
- Executes a configurable toolchain (kglab / tree-sitter / semgrep) on a repository
- Uploads artifacts to the user's HuggingFace dataset (using HF_TOKEN) or Space repo
- Calls back MetaMCP's callback URL with a small pointer to results

IMPORTANT:
- This is a scaffold intended to be run in a controlled, user-owned HF Space.
- The worker uses `git` to clone repos; ensure `git` is available in the runtime.
- The worker expects environment variables to be configured in the HF Space:
  - `HF_TOKEN` : HuggingFace token for uploading artifacts (user-provided)
  - `META_PUBLIC_KEY` : MetaMCP public RSA key (PEM) used to verify job envelopes
  - Optional: `WORKER_ID`, `DEFAULT_HF_REPO` (destination repo/dataset for artifacts)

Security model options:
- Pull model: the worker can poll MetaMCP for signed jobs instead of receiving push calls.
- Push model: MetaMCP posts signed envelopes to `/mcp/exec` on this worker.

Deploy:
- Clone this repo into a new HF Space, set env vars, and run. The HF Space will host FastAPI endpoints.
- Ensure you keep your HF token private (use HF Space secrets).

