# Next.js Frontend Architecture

The frontend is a Next.js 14+ application using the App Router, built with TypeScript for type safety and performance. It provides an interactive UI for project management, code editing, AI agent interactions, and knowledge graph visualization. Deployed to Vercel for edge caching and global distribution, it integrates seamlessly with the backend orchestrator.

## App Structure

The frontend follows Next.js conventions with modular routing and component-based design:

```
frontend/ (or root for app)
├── app/                  # App Router pages and layouts
│   ├── auth/             # Authentication pages
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── projects/         # Project management
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   ├── editor/           # Code editor interface
│   │   └── page.tsx
│   ├── agents/           # AI agent chat
│   │   └── page.tsx
│   ├── knowledge-graph/  # KG visualization
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout (AppShell)
│   └── page.tsx          # Landing/dashboard
├── components/           # Reusable UI components
│   ├── ui/               # Radix UI primitives + Tailwind
│   │   ├── DataTable.tsx
│   │   ├── Card.tsx
│   │   └── CommandPalette.tsx
│   ├── editor/           # Editor-specific
│   │   ├── CodeEditor.tsx
│   │   └── FileTree.tsx
│   └── agents/           # Agent UI
│       └── ChatInterface.tsx
├── lib/                  # Services and utilities
│   ├── services/         # API clients
│   │   ├── MetaMCPClient.ts
│   │   ├── GitHubService.ts
│   │   └── HuggingFaceService.ts
│   └── utils/            # Helpers (e.g., graphLayout.ts)
├── store/                # Zustand stores
│   ├── useAuthStore.ts
│   └── useProjectStore.ts
├── types/                # TypeScript definitions
│   ├── agent.ts
│   └── task.ts
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind setup
└── package.json          # Dependencies: next, react, monaco-editor, zustand, etc.
```

Pages use server components for initial renders, client components for interactivity.

## State Management

- **Zustand**: Lightweight global state for user session, projects, open files, AI context.
  Example store:
  ```typescript
  interface AppState {
    user: User | null;
    currentProject: Project | null;
    openFiles: Record<string, string>;
    selectedAgent: Agent | null;
    knowledgeGraph: KnowledgeGraph | null;
    // Actions
    setProject: (project: Project) => void;
    updateFile: (path: string, content: string) => void;
  }
  const useAppStore = create<AppState>((set) => ({
    user: null,
    currentProject: null,
    // ...
    setProject: (project) => set({ currentProject: project }),
  }));
  ```

- **React Query**: For server-state like task history, MCP capabilities, caching API calls.
  - Queries: `useQuery({ queryKey: ['tasks'], queryFn: fetchTasks })`.
  - Mutations: `useMutation({ mutationFn: createTask })` for project creation.

This combo avoids prop drilling while keeping re-renders minimal.

## Core Modules

### 1. Authentication Module (`app/auth/`)

Handles OAuth flows and session management.

Features:
- Providers: GitHub, Hugging Face via NextAuth.js.
- Token refresh, scope permissions UI.
- Components: `LoginPage.tsx`, `AccountSettings.tsx`, `PermissionsManager.tsx`.
- Hooks: `useAuth()`, `useSession()`.

Integrates with backend `/api/auth` for JWT exchange.

### 2. Project Management Module (`app/projects/`)

Manages project lifecycle.

Features:
- Wizard for creation (template selection, repo setup).
- List, settings, collaborators.
- Components: `ProjectWizard.tsx`, `ProjectCard.tsx`, `CollaboratorsList.tsx`.
- Services: `ProjectService` for CRUD via backend API.

On creation: Calls backend to generate repo (GitHub), scaffold (MCP), KG (kglab).

### 3. Code Editor Module (`app/editor/`)

Multi-file editing with AI assistance.

Features:
- Monaco Editor integration for syntax highlighting, diffs.
- File tree, tabs, git viewer.
- AI suggestion panel.
- Components: `CodeEditor.tsx`, `FileTree.tsx`, `DiffViewer.tsx`, `AIAssistPanel.tsx`.
- Services: `FileSystemService` (via GitHub MCP), `LanguageService` (Tree-sitter MCP).

Supports live previews and auto-save.

### 4. AI Agent Interface (`app/agents/`)

Chat-based interaction with agents.

Features:
- Agent selector, context builder, task history.
- Marketplace for templates.
- Components: `AgentSelector.tsx`, `ChatInterface.tsx`, `TaskHistory.tsx`.
- Types: `Agent`, `Task`, `ChatMessage`.

Tasks route through backend to MCPs; streams responses via SSE.

### 5. Knowledge Graph Visualizer (`app/knowledge-graph/`)

Interactive graph for code relationships.

Features:
- Rendering with Cytoscape.js, search/filter, entity explorer.
- Export to HF Datasets.
- Components: `GraphCanvas.tsx`, `EntityExplorer.tsx`, `GraphControls.tsx`.
- Utilities: `graphLayout.ts`, `graphFilters.ts`.

Built from project analysis via backend KG endpoints.

## Services Layer

Abstracts backend and external APIs:

- **MetaMCPClient**: `executeTask(task)`, `getCapabilities()`.
- **GitHubService**: `createRepo()`, `commitFiles()`, `getRepoStructure()`.
- **HuggingFaceService**: `deploySpace()`, `uploadDataset()`, `queryKnowledgeGraph()`.
- **ProjectService**: `createProject()`, `loadProject()`.
- **AIService**: `generateCode()`, `debugCode()`.

Uses Axios or fetch with auth headers (JWT from Zustand).

## UI/UX Components

Reusable library with Tailwind for styling:

- **Layout**: `AppShell.tsx` (sidebar, header), `Sidebar.tsx`.
- **Data**: `DataTable.tsx` (sortable), `Timeline.tsx` (activity).
- **Inputs**: `CommandPalette.tsx` (Cmd+K), `SearchBar.tsx`, `CodeInput.tsx`.
- **Feedback**: `Toast.tsx`, `ProgressBar.tsx`, `ErrorBoundary.tsx`.
- **Modals**: `Dialog.tsx`, `Drawer.tsx` for panels.

Radix UI for primitives (e.g., dropdowns, tabs); shadcn/ui patterns.

## Best Practices

- **Performance**: ISR for static pages, image optimization, code splitting.
- **Accessibility**: ARIA labels in Monaco, keyboard nav in graphs.
- **Testing**: Vitest for units, Playwright for E2E (coverage 80%).
- **Security**: Sanitize inputs, secure cookies for auth.

For development: [Frontend Development](../developer/frontend-development.md). Cross-ref: [Overview](overview.md).

Back to [Architecture](../index.md).