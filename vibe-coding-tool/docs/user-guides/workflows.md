# Common Workflows

This guide covers everyday workflows in the Vibe Coding Tool, from code generation to knowledge graph management. Each workflow includes step-by-step instructions, expected outcomes, and tips for optimization. These build on [Onboarding](onboarding.md) and leverage the tool's AI agents and MCP integrations.

Workflows are designed for efficiency: Frontend handles UI, backend routes tasks, MCPs execute specialized work.

## 1. Code Generation

Generate or refactor code using AI agents, with context from your project KG and files.

### Steps:
1. **Open Project and File**:
   - Dashboard: Select project.
   - Editor: Open file (e.g., `src/components/TodoList.tsx`) from file tree.

2. **Initiate Generation**:
   - Open AI Panel (sidebar icon or Cmd+K > "AI Assist").
   - Select agent: "Code Generator" (or custom from marketplace).
   - Build context: Auto-includes open file, project KG (query "related components"), git history.
   - Prompt: "Generate a todo list component using Zustand for state, with add/delete functionality."

3. **Execute Task**:
   - Click "Generate". Task sent to backend `/api/agents/execute`.
   - Progress: Real-time stream in chat (e.g., "Analyzing context...", "Generating code...").
   - Backend routes to AI MCP (e.g., Your-PaL-MoE in your HF Space).

4. **Review and Apply**:
   - Diff viewer shows changes (green: added, red: removed).
   - Preview: Live render if applicable (e.g., React component).
   - Actions: "Accept" (auto-commit to GitHub, update KG), "Reject", "Modify" (edit prompt).
   - On accept: File updates, task history logs success.

### Expected Outcome:
- New/updated code in editor.
- KG updated with new entities (e.g., "TodoList" node, "uses Zustand" edge).
- GitHub commit with message like "AI: Add todo list component".

### Tips:
- Provide specific prompts for better results (e.g., "Use TypeScript, follow shadcn/ui").
- If heavy (large codebase), uses pointer results – download if needed.
- Debug: If output wrong, check task logs for MCP errors.

## 2. Knowledge Graph Building

Build and query an interactive KG from your project for insights into structure and relationships.

### Steps:
1. **Trigger KG Generation**:
   - Project dashboard: Click "Generate KG" or auto on project create.
   - Or manual: Editor > Tools > "Analyze Project" (POST /api/kg/generate).

2. **Processing**:
   - Select scope: "Entire project" or "Selected files".
   - Backend routes to kglab GKG Ingest MCP (your HF Space).
   - Progress: "Ingesting files...", "Extracting entities...", "Building relationships".
   - Inputs: Files fetched via GitHub MCP, analyzed for code entities (classes, functions, imports).

3. **View and Interact**:
   - KG tab: Graph loads with nodes (e.g., functions), edges (calls/imports).
   - Tools: Search "state management", filter by type, expand relationships.
   - Query: SPARQL in panel (e.g., "SELECT ?component WHERE { ?component rdf:type Component }").

4. **Update and Export**:
   - After code changes: "Refresh KG" (incremental update).
   - Export: "Save to HF Dataset" (POST /api/kg/export) for sharing/persistence.

### Expected Outcome:
- Interactive graph visualizing code architecture.
- Queries return results (e.g., dependency tree).
- Exported dataset in your HF account.

### Tips:
- For large projects, use incremental mode to avoid full re-ingest.
- Integrate with agents: "Explain this KG node" for natural language insights.
- Privacy: KG processed in your Space; no data leaves unless exported.

## 3. MCP Task Execution

Execute specialized tasks via MCPs, like code analysis or deployment.

### Steps:
1. **Select Task**:
   - Dashboard: "Execute Task" or Editor > Tools menu.
   - Choose type: "Code Analysis" (Semgrep), "File Search" (GitHub MCP), "Deploy Space" (HF).

2. **Configure**:
   - Input: e.g., for analysis, select files or "Entire repo".
   - MCP: Auto-selected or manual (from [MCP Servers](../mcps/index.md)).
   - Advanced: Set priority, required capabilities.

3. **Run Task**:
   - Submit: Backend creates task, routes (e.g., Semgrep to your Space).
   - Monitor: Task history shows status, logs stream.
   - If fallback: Consent prompt for oracle execution.

4. **View Results**:
   - Success: Results in UI (e.g., Semgrep issues list with fixes).
   - Pointers: Download link for large outputs (e.g., full scan report).

### Expected Outcome:
- Task-specific output (e.g., security vulnerabilities, file list).
- Applied changes if applicable (e.g., auto-fix commits).

### Tips:
- Health check MCPs first ([MCP Registry](../architecture/mcp-registry.md)).
- Custom MCPs: Deploy via HF, add to registry for availability.
- Batch tasks: Queue multiple for parallel execution (limited by concurrency).

## 4. File Management via GitHub

Manage project files with GitHub integration for version control.

### Steps:
1. **Repo Setup** (On Project Create):
   - Auto-creates GitHub repo if enabled.
   - Initial commit with scaffolded files.

2. **Edit and Commit**:
   - Editor: Make changes in Monaco.
   - Save: Auto or manual – calls GitHubService.commitFiles().
   - Diff: Review before commit; message auto-generated (e.g., "Update TodoList").

3. **Advanced Ops**:
   - Branch/PR: Tools > "Create Branch" or "Open PR" (routes to GitHub MCP).
   - Clone External: "Import Repo" – fetches structure via File-Seek wrapper.
   - History: Timeline component shows commits, diffs.

4. **Sync**:
   - Pull latest: "Sync from GitHub" to reload files.
   - Push: After AI changes, auto-push on accept.

### Expected Outcome:
- Synced repo on GitHub with all changes.
- Local editor always current.

### Tips:
- Branch protection: Enable in GitHub settings for safety.
- Large files: Use Git LFS if needed; tool supports.
- Collaboration: Invite via project settings (OAuth-linked users).

These workflows cover 85% of daily use. For features: [Features](features.md). Questions: [FAQ](faq.md).

Back to [User Guides](index.md).