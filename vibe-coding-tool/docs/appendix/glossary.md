# Glossary

This appendix defines key terms used throughout the Vibe Coding Tool documentation. Terms are drawn from the development plans, technical specifications, and MCP ecosystem.

- **MCP (Model Context Protocol)**: Protocol for specialized servers handling tasks like code analysis. MCPs expose tools via standardized endpoints (/tools, /execute).
- **MetaMCP**: The orchestrator system for routing tasks to MCPs based on capabilities and user preferences.
- **Orchestrator**: Backend FastAPI server managing task routing, job queuing, and registry.
- **HF Space**: Hugging Face Space for deploying MCPs, providing user-owned compute for heavy tasks.
- **KG (Knowledge Graph)**: Interactive graph of code entities and relationships, built using kglab GKG Ingest MCP.
- **Task Router**: Component that selects MCP for a task based on required capabilities and flags (e.g., can_run_on_user_space).
- **Job Manager**: Handles task lifecycle, queuing with RQ, execution, and retries.
- **Pointer Result**: Lightweight reference to large data stored in HF Dataset, used for heavy MCP outputs to avoid large API payloads.
- **Split-Processing**: Model where light tasks run on oracle, heavy on user HF Spaces for privacy and cost.
- **JWT**: JSON Web Token for API authentication, with scopes for permissions.
- **OAuth**: Protocol for external auth (GitHub, HF), linking accounts for integrations.
- **Pydantic Models**: Data validation schemas for API requests/responses in backend.
- **Zustand**: Lightweight state management library for frontend global state (user, projects).
- **Monaco Editor**: Code editor component for multi-file editing with syntax highlighting.
- **Semgrep**: Built-in MCP for static code analysis and security scanning.
- **Tree-sitter**: Built-in MCP for syntax parsing and AST generation.
- **RS256**: RSA SHA-256 algorithm for signing job envelopes between orchestrator and MCPs.

For more technical terms, see [Architecture](../architecture/overview.md).

Back to [Appendix](index.md).