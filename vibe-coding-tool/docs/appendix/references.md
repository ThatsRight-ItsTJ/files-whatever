# References

This appendix lists external resources, clone report summary, and key references used in the Vibe Coding Tool project. For full source, see GitHub repo.

## External Links

- **GitHub Repo**: https://github.com/ThatsRight-ItsTJ/vibe-coding-tool – Source code, issues, contributions.
- **Hugging Face**: https://huggingface.co – For Spaces, Datasets, models.
- **MCP Specification**: https://spec.modelcontextprotocol.io – Protocol for MCP servers.
- **FastAPI Docs**: https://fastapi.tiangolo.com – Backend framework.
- **Next.js Docs**: https://nextjs.org/docs – Frontend framework.
- **Monaco Editor**: https://microsoft.github.io/monaco-editor – Code editor.
- **Zustand**: https://zustand-demo.pmnd.rs – State management.
- **Semgrep**: https://semgrep.dev/docs – Code analysis tool.
- **Tree-sitter**: https://tree-sitter.github.io/tree-sitter – Parsing library.
- **Playwright**: https://playwright.dev – E2E testing.
- **Prometheus/Grafana**: https://prometheus.io, https://grafana.com – Monitoring.

## Clone Report Summary

From clone_log_20250920_203312.txt (directory_structure.txt equivalent):

The project clones core and dependencies:
- Success: libraries-io-mcp-server (deps analysis), Your-PaL-MoE-v0.3 (AI proxy), GitHub-File-Seek (file ops), kglab-gkg-ingest-adapter (KG), seeding-orchestrator-mcp (DB seed), hfspace-worker-template (MCP scaffold).
- Official MCPs: mcp-servers (community), playwright-mcp (testing), mcp-database-server (DB).
- Not Found (skippable): Some like anthropic-mcp-servers; use alternatives or ignore.

Full log shows 50+ repos cloned, covering frontend deps (react-monaco), backend (fastapi), MCPs.

## Key Documents

- **Development Plan**: DEVELOPMENT_PLAN.md – High-level features, timeline.
- **Implementation Plan**: Implementation_Plan.md – Technical specs, endpoints, models.
- **Technical Specifications**: Technical_Specifications.md – API, data flow.
- **Testing Strategy**: TESTING.md – Unit/integration/E2E, coverage targets.

For license: [License](license.md).

Back to [Appendix](index.md).