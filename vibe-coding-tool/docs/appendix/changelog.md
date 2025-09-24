# Changelog

This changelog summarizes versions and changes for the Vibe Coding Tool, based on DEVELOPMENT_PLAN.md and Implementation_Plan.md. Versions follow semantic versioning (major.minor.patch).

## v1.0.0 (Initial Release)

- Initial implementation of MetaMCP orchestrator with FastAPI backend and Next.js frontend.
- Core features: Task routing, MCP registry, KG visualization.
- Integrations: GitHub, Hugging Face.
- MCPs: Built-in Semgrep, Tree-sitter; custom Libraries.io, Your-PaL-MoE.
- Deployment: Docker Compose, HF Spaces, Vercel.
- Testing: Pytest (backend >85%), Vitest/Playwright (frontend >70%).
- Documentation: Full guides for users and developers.

From Implementation_Plan.md: Complete split-processing, API endpoints, models.

## v0.9.0 (Beta)

- Added MCP discovery and health monitoring.
- Frontend: Monaco Editor integration, Zustand state.
- Backend: RQ queuing, Pydantic models.
- Security: JWT auth, OAuth for GitHub/HF.
- Monitoring: Prometheus/Grafana setup.

Preceded by alpha with basic routing.

## Earlier Versions

- v0.8.0: Core architecture (task router, job manager).
- v0.7.0: Initial frontend scaffolding.
- v0.6.0: MCP template and examples.

For detailed commits, see GitHub history. Future: v1.1.0 with multi-agent support.

Back to [Appendix](index.md).