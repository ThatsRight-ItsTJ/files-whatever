## **MetaMCP Split‑Processing — Updated Dev Plan (with Seeding Orchestrator MCP Details)**

### 1️⃣ Already Built / Integrated
| Component | Status | Notes |
|-----------|--------|-------|
| **MetaMCP Registry** (`metamcp_registry.json`) | ✅ | Routing flags (`can_run_on_user_space`, `result_pointer_preferred`, `fallback_to_oracle`). |
| **HF Space Worker Template** ([repo](https://github.com/ThatsRight-ItsTJ/files-whatever/tree/main/hfspace-worker-template)) | ✅ | Full-featured HF Space MCP worker scaffold with signed job verification, capability probes, kglab/semgrep/tree‑sitter pipelines, pointer results, callback support. **Reference pattern** for all heavy compute MCPs. |
| **Seeding Orchestrator MCP** ([repo](https://github.com/ThatsRight-ItsTJ/files-whatever/tree/main/seeding-orchestrator-mcp)) | ✅ | Unifies Prisma DB seed, Django loaddata, Alembic migrations into one `seed()` tool. **Reference pattern** for multi‑backend orchestration MCPs. |
| **GitHub File‑Seek MCP Wrapper** ([repo](https://github.com/ThatsRight-ItsTJ/files-whatever/tree/main/github-file-seek-mcp-wrapper)) | ✅ | Oracle‑hosted wrapper around GitHub API. **Reference pattern** for all lightweight wrappers. |
| **kglab GKG Ingest Adapter** ([repo](https://github.com/ThatsRight-ItsTJ/files-whatever/tree/main/kglab-gkg-ingest-adapter)) | ✅ | HF Space MCP for ingesting/querying/exporting Knowledge Graphs. Scaffold includes ingestion, SPARQL, export, stats; extensible for entity/relation extraction. |
| **Semgrep MCP** ([semgrep/mcp](https://github.com/semgrep/mcp)) | ✅ | Off‑the‑shelf; deploy in HF Space using template. |
| **Tree‑sitter MCP** ([wrale/mcp-server-tree-sitter](https://github.com/wrale/mcp-server-tree-sitter)) | ✅ | Off‑the‑shelf; deploy in HF Space using template. |
| **Libraries.io MCP Server** ([ThatsRight-ItsTJ/libraries-io-mcp-server](https://github.com/ThatsRight-ItsTJ/libraries-io-mcp-server)) | ✅ | Full MCP server for package discovery, dependency analysis, and ecosystem insights. |
| **Fallback Oracle Worker** (`metamcp_artifacts/fallback_oracle_worker`) | ✅ (scaffold) | Needs final integration/testing with orchestrator. |
| **Job Signing Samples** (`metamcp_artifacts/job_signing_samples`) | ✅ | Reference implementation for RS256 JWT job signing/verification. |
| **Preflight Consent** (`metamcp_artifacts/preflight_consent`) | ✅ | JSON schema + UI copy for capability probes and consent prompts. |
| **Architecture Docs** (`Proposal — MetaMCP split model.md`, `MetaMCP High-level design.md`) | ✅ | Context for devs & stakeholders. |

---

### 2️⃣ Remaining MCPs / Wrappers to Build

**Priority 1 — Oracle VPS Wrappers (lightweight)**
- **Cloudflare MCP Wrapper** — Wrap official Cloudflare MCP to handle DNS, KV, R2, Workers API calls in orchestrator‑friendly format.  
  **Pattern:** Follow `github-file-seek-mcp-wrapper` structure — FastAPI, minimal manifest, only required endpoints, env‑based auth.

**Priority 2 — HF Space Heavy Compute MCPs**  
*(All to be built by extending `hfspace-worker-template`)*  
- **Coverage Aggregator MCP** — Wrap coverage.py, nyc, JaCoCo; normalize outputs to JSON; pointer‑based results.  
- **Custom NLP/ML MCPs** — Any domain‑specific heavy jobs not yet scaffolded (e.g., summarization, classification pipelines).

**Priority 3 — Deployment & Ops**
- **HF Space Deployment Scripts** — Automate pushing MCPs to user Spaces with correct env vars, tokens, and registry updates.
- **Finalize Fallback Oracle Worker** — Integrate with orchestrator routing and test failover scenarios.

---

### 3️⃣ Development Flow

1. **Integrate Off‑the‑Shelf MCPs**  
   - Deploy Semgrep MCP, Tree‑sitter MCP, Libraries.io MCP, and kglab GKG Ingest Adapter in HF Spaces using `hfspace-worker-template`.  
   - Add entries to `metamcp_registry.json` with correct routing flags.

2. **Implement Remaining Wrappers**  
   - Build Cloudflare MCP Wrapper using `github-file-seek-mcp-wrapper` as the reference pattern.

3. **Build Remaining Heavy Compute MCPs**  
   - Extend `hfspace-worker-template` for Coverage Aggregator and NLP/ML MCPs.

4. **Integrate `metamcp_artifacts` Components**  
   - Embed job signing logic from `job_signing_samples` into all MCPs.  
   - Implement preflight consent flow from `preflight_consent` in orchestrator.  
   - Finalize and test `fallback_oracle_worker`.

5. **Testing & Hardening**  
   - Capability probes for each MCP.  
   - Verify signed envelopes, consent flows, and fallback logic.

---

### 4️⃣ Deliverables for Each New MCP
- MCP code (wrapper or HF Space worker).
- JSON manifest with correct routing flags.
- Test logs showing orchestrator integration.
- Updated `metamcp_registry.json`.

---

If you want, I can now **produce the sprint‑by‑sprint execution plan** where the Seeding Orchestrator MCP is explicitly documented as a completed, multi‑backend reference MCP, and the remaining work is sequenced for minimal dependency risk.  

Do you want me to prepare that sprint breakdown next?
