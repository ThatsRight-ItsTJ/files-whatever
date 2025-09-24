# User Onboarding Workflow

Welcome! This guide walks you through the initial setup after installation, from account creation to your first successful task. The onboarding process is designed to be intuitive, taking about 5-10 minutes. It integrates OAuth for secure auth and automatically deploys your personal MCP Space for heavy tasks.

Prerequisites: Complete [Installation](../getting-started/installation.md) and access the app at http://localhost:3000 (or your production URL).

## Step 1: Account Creation (OAuth)

1. **Launch the App**:
   - Open the Vibe Coding Tool in your browser.
   - You'll see the landing page with feature highlights and "Get Started" button.

2. **Sign In**:
   - Click "Sign In" or "Get Started".
   - Choose provider: GitHub or Hugging Face.
     - **GitHub**: Redirects to GitHub OAuth. Grant permissions for repo access (read/write for projects).
     - **Hugging Face**: Redirects to HF login. Grant token access for Spaces and datasets.
   - On callback, the app exchanges code for tokens and creates your user profile in the backend (stored in PostgreSQL).

3. **Permissions UI**:
   - Review scopes: e.g., "Access your repos", "Deploy to HF Spaces".
   - Click "Authorize" to proceed. This links accounts via backend `/api/user/link-account`.

4. **Session Established**:
   - Redirect to dashboard. Zustand store updates with user data.
   - If issues (e.g., invalid redirect), check [Troubleshooting](../getting-started/troubleshooting.md#oauth-failures).

Your account is now active! JWT token is stored securely (httpOnly cookie).

## Step 2: Project Setup

1. **Initial Space Deployment** (Automated):
   - On first login, the backend detects no Space and triggers deployment via HF Service.
   - Progress bar shows "Deploying your MCP Space..." (2-3 minutes).
   - Uses `hfspace-worker-template` to create a basic Space with built-in MCPs (e.g., Tree-sitter).
   - Once ready, added to your MCP registry with `can_run_on_user_space: true`.

2. **Create First Project**:
   - Dashboard: Click "New Project".
   - **Wizard Steps** (from frontend plan):
     - **Name/Description**: e.g., "My Todo App", "React project with AI features".
     - **Template Selection**: Choose from gallery (e.g., "Next.js", "Python Flask"). Defaults to basic scaffold.
     - **Framework/Language**: Select TypeScript, Python, etc.
     - **Features**: Toggle KG generation, GitHub repo creation.
   - Submit: Backend creates GitHub repo (via GitHubService), scaffolds files (routes to AutoBot MCP if available), generates initial KG (kglab ingest).
   - Status: Monitor in task history; email notification on completion.

3. **Project Loaded**:
   - Redirect to editor view.
   - File tree loads from GitHub MCP.
   - KG panel shows initial graph (entities: components, relationships: imports).

If deployment fails (e.g., HF token invalid), fallback to oracle-hosted MCPs with consent prompt.

## Step 3: Task Creation

1. **Basic Task**:
   - In editor, open a file (e.g., `page.tsx`).
   - Open AI Panel (sidebar): Select agent "Code Generator".
   - Enter prompt: "Add a todo list with Zustand state management".
   - Context: Auto-includes current file, project KG query.
   - Click "Generate": Frontend mutates to backend `/api/agents/execute`.

2. **Task Routing** (Behind the Scenes):
   - Backend routes to suitable MCP (e.g., AI agent in your Space).
   - Progress: Real-time updates via SSE (streaming).

3. **Review and Apply**:
   - Diff viewer shows changes.
   - Accept: Auto-commits to GitHub, updates KG.
   - Reject/Modify: Edit prompt and retry.

## Step 4: Result Viewing

1. **Task History**:
   - Sidebar: View recent tasks, status (pending/running/completed).
   - Click for details: Input, output, MCP used, duration.

2. **Knowledge Graph**:
   - Navigate to KG tab: Interactive graph updates with new code (e.g., new nodes for todo component).
   - Search/Filter: Query entities (e.g., "state management").
   - Export: Save to HF Dataset.

3. **Tutorial Walkthrough**:
   - On first project, optional interactive tour highlights editor, agents, KG.
   - Dismiss or complete for badges/unlocks.

## Tips for Success

- **First Task**: Start with simple code gen to test flow.
- **Consent Prompts**: Approve fallbacks for reliability during onboarding.
- **Customization**: After setup, deploy custom MCPs via [MCP Servers](../mcps/custom-mcps.md).
- **Monitoring**: Check dashboard metrics for task success rates.

Onboarding complete! Dive into [Workflows](workflows.md) for daily use or [Features](features.md) for advanced capabilities.

If stuck: [FAQ](faq.md) or [Troubleshooting](../getting-started/troubleshooting.md).