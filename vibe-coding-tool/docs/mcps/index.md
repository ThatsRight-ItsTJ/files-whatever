# MCP Servers

Model Context Protocol (MCP) servers are the specialized engines behind the Vibe Coding Tool's capabilities. This section covers built-in, custom, and community MCPs, how to deploy them, and configuration. MCPs handle tasks like code analysis (Semgrep), parsing (Tree-sitter), and more, routed by the orchestrator.

From the clone report, the project includes clones of official/community MCPs and custom ones. MCPs are deployed to HF Spaces for heavy compute or oracle for light.

## Sections

- **[Built-in MCPs](builtin-mcps.md)**: Core MCPs like Semgrep and Tree-sitter for code analysis.
- **[Custom MCPs](custom-mcps.md)**: User-developed, e.g., Libraries.io for dependencies, Your-PaL-MoE for AI.
- **[Community MCPs](community-mcps.md)**: Third-party, e.g., Playwright for testing, database MCPs.
- **[Development](development.md)**: Creating your own (cross-ref to [Developer - MCP Development](../developer/mcp-development.md)).
- **[Configuration](configuration.md)**: mcp-config.json and registry integration.

## Overview

MCPs are FastAPI servers exposing tools via MCP protocol. The orchestrator discovers them via registry (`metamcp_registry.json`), routes based on capabilities, and monitors health.

Key MCPs from clone log:
- Built-in: Semgrep, Tree-sitter (code analysis).
- Custom: Libraries.io (deps), Your-PaL-MoE (AI proxy), GitHub File-Seek wrapper.
- Community: Playwright (E2E testing), mcp-database-server (DB ops).

Deploy to HF Spaces for scalability; add to registry for use.

For integration: [MCP Registry](../architecture/mcp-registry.md). Usage: [User Guides](../user-guides/workflows.md).

Explore below to extend your tool's capabilities!