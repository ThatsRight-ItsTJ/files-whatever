# Frequently Asked Questions

This FAQ synthesizes common questions from user reports, development plans, and technical specifications. For setup issues, see [Troubleshooting](../getting-started/troubleshooting.md). If your question isn't answered, check [GitHub Issues](https://github.com/ThatsRight-ItsTJ/vibe-coding-tool/issues) or community forums.

## General

**What is the Vibe Coding Tool?**  
A MetaMCP orchestrator for AI-assisted coding, integrating frontend editing, backend task routing, and MCPs for specialized tasks like code analysis and KG building. It supports split-processing: light tasks on oracle, heavy on your HF Spaces.

**Who should use it?**  
End-users for AI code gen, developers for extensions, admins for deployment. Ideal for projects needing intelligent routing and privacy-focused compute.

**Is it free?**  
Yes, open-source (MIT license). HF Spaces may incur costs for heavy use; oracle hosting (e.g., Oracle Cloud) is low-cost.

## Setup and Onboarding

**Why does OAuth fail?**  
Common causes: Invalid redirect URI in GitHub/HF app settings, or mismatched domains (localhost vs production). Verify URIs like `http://localhost:3000/auth/github/callback`. Clear browser cache and retry.

**How long does HF Space deployment take?**  
2-3 minutes on first login. If longer, check HF token permissions and network. Fallback to oracle MCPs during wait.

**Can I use without HF account?**  
Yes, but limited to oracle-hosted MCPs (light tasks). Heavy features like Semgrep require Spaces for full privacy/scalability.

## Usage and Workflows

**How do I generate code?**  
See [Code Generation Workflow](workflows.md#code-generation). Use AI Panel with specific prompts; context from KG/files improves accuracy.

**What if a task fails?**  
Check task history for errors (e.g., MCP unhealthy). Retries automatic (3x); fallback prompts for consent. Common: Network to HF Space – verify health in [MCP Registry](../architecture/mcp-registry.md).

**How does KG work?**  
Generated via kglab MCP from code analysis. Interactive with search/query; updates incrementally. Export to HF for persistence.

**Can I edit multiple files?**  
Yes, Monaco supports tabs/tree. Changes auto-sync to GitHub on save/commit. Use global search for cross-file replaces.

**What are MCPs?**  
Model Context Protocol servers for specialized tasks (e.g., Semgrep for scans). Built-in/custom/community; deploy to HF for heavy compute. See [MCP Servers](../mcps/index.md).

**How to handle large results (e.g., full scan reports)?**  
Uses pointers: MCP stores in HF Dataset, backend returns link. Download via UI or API GET /results/{id} (auto-resolves).

## Performance and Limits

**Why are some tasks slow?**  
Heavy MCPs run in your HF Space (GPU/CPU limits apply). Light tasks <2s. Monitor queue in dashboard; scale Space if needed.

**Rate limiting?**  
Yes, 100 requests/min default (configurable in .env). Exceeded? Wait or increase RATE_LIMIT_REQUESTS.

**Concurrency limits?**  
10 jobs default (MAX_CONCURRENT_JOBS). For more, adjust in backend; monitor via Grafana.

## Integrations and Customization

**GitHub integration issues?**  
Ensure OAuth scopes (repo:write). Test: "Import Repo" – if fails, check token in account settings.

**How to add custom MCP?**  
Deploy using [HF Template](../mcps/development.md), update registry with URL/capabilities. Consent for use in tasks.

**Cloudflare MCP?**  
For DNS/KV/Workers; deploy wrapper from cloudflare-mcps. Add to registry for edge tasks.

**Libraries.io for deps?**  
Use custom MCP: "Analyze Dependencies" task scans ecosystems, suggests updates.

## Advanced

**Fallback to oracle?**  
For unavailable user MCPs, if flag enabled. Consent UI explains costs/privacy; approve for reliability.

**Monitoring my usage?**  
Dashboard shows task stats, success rates. Full: Grafana (localhost:3000) for metrics/logs.

**Export data?**  
Projects to GitHub, KG to HF Datasets, tasks to JSON via API.

**Security concerns?**  
JWT for auth, signed jobs (RS256), user Space isolation. No central data storage; review [Security](../deployment/production.md#security).

For more, see [Features](features.md) or [Workflows](workflows.md). Contribute questions to docs!

Back to [User Guides](index.md).