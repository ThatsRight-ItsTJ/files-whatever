# Feature Overview

The Vibe Coding Tool offers a rich set of features powered by AI agents, advanced editing, and seamless integrations. This section details key capabilities, how to use them, and their benefits. Features are accessible via the UI after [onboarding](onboarding.md), with tasks routed intelligently via the backend.

## AI Assistance

Leverage AI for code generation, debugging, and refactoring with context-aware agents.

### How to Use:
- **Access**: Open AI Panel in editor (sidebar or Cmd+K > "AI Assist").
- **Agents**: Select from marketplace (e.g., "Code Generator", "Debugger").
- **Prompting**: Enter natural language (e.g., "Refactor this function for performance").
- **Context**: Auto-includes open files, KG query, git diff.
- **Execution**: Submit; stream results in chat. Review diff, apply changes.

### Benefits:
- **Productivity**: Generate boilerplate or fixes in seconds.
- **Accuracy**: KG context reduces hallucinations; MCPs like Tree-sitter provide syntax awareness.
- **Customization**: Create custom agents with templates (e.g., "Style Guide Enforcer").

Example: "Debug this React hook" – routes to debug MCP, suggests fixes with explanations.

## Multi-File Editing

Edit multiple files simultaneously with Monaco Editor, synced to GitHub.

### How to Use:
- **File Tree**: Sidebar shows project structure (fetched via GitHub MCP).
- **Tabs**: Open multiple files; drag/drop to reorder.
- **Search/Replace**: Global search across files (Cmd+Shift+F).
- **Diff Viewer**: See changes before commit; accept/reject hunks.
- **Auto-Save**: Optional; commits on explicit "Save All".

### Benefits:
- **Efficiency**: No context switching; edit frontend/backend together.
- **Version Control**: Real-time git integration prevents conflicts.
- **Collaboration**: Live previews for PRs.

Supports 100+ languages via Monaco; large projects use lazy loading.

## Interactive Graphs (Knowledge Graph)

Visualize code relationships with an interactive KG for navigation and insights.

### How to Use:
- **Access**: KG tab or panel in editor.
- **View**: Nodes (classes/functions), edges (imports/calls) rendered with Cytoscape.
- **Interact**: Zoom/pan, search (e.g., "useState"), filter by type (components only).
- **Explore**: Click node for details (code snippet, dependencies); expand relationships.
- **Query**: SPARQL panel for advanced (e.g., "Find cycles in imports").

### Benefits:
- **Understanding**: See architecture at a glance; identify bottlenecks.
- **AI Integration**: Query KG in prompts (e.g., "Refactor based on this graph").
- **Export**: Save as HF Dataset for sharing or external tools.

Built incrementally; updates on code changes via kglab MCP.

## MCP Integration

Execute specialized tasks with MCPs for analysis, testing, deployment.

### How to Use:
- **Access**: Tools menu or task executor in dashboard.
- **Select MCP**: Browse [MCP Servers](../mcps/index.md); e.g., "Run Semgrep" for security scan.
- **Configure**: Input params (files, rules); set priority.
- **Execute**: Routes automatically; monitor in history.
- **Custom**: Deploy your own (e.g., Libraries.io for deps), add to registry.

### Benefits:
- **Extensibility**: Offload heavy compute to HF Spaces (no oracle costs).
- **Ecosystem**: Built-in (Semgrep, Tree-sitter), custom (Your-PaL-MoE), community (Playwright).
- **Fallbacks**: Seamless if MCP down; consent for oracle.

Examples: "Test with Playwright" for E2E, "Ingest KG" for graph building.

These features work together: AI uses KG context, edits sync via MCPs. For workflows: [Workflows](workflows.md). Questions: [FAQ](faq.md).

Back to [User Guides](index.md).