# Frontend Development Guide

This guide is for developers working on the Next.js frontend. It covers setting up the dev environment, component structure, API integration, editor setup, state management, and testing. Builds on [Architecture - Frontend](../architecture/frontend.md) and assumes Node 18+.

## Setting Up Dev Environment

1. **Prerequisites**:
   - Node.js 18+, npm 8+.
   - Backend running (see [Backend Development](backend-development.md)).
   - GitHub/HF tokens for auth testing.

2. **Clone and Install**:
   ```
   git clone https://github.com/ThatsRight-ItsTJ/vibe-coding-tool.git
   cd vibe-coding-tool  # Assuming frontend in root
   npm install
   ```

3. **Environment Variables**:
   - Create `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your-nextauth-secret  # openssl rand -base64 32
     GITHUB_ID=your-github-client-id
     GITHUB_SECRET=your-github-client-secret
     HUGGINGFACE_ID=your-hf-client-id
     HUGGINGFACE_SECRET=your-hf-client-secret
     ```
   - For dev: Add `DEBUG=true` if needed.

4. **Run Server**:
   ```
   npm run dev
   ```
   - Access: http://localhost:3000.
   - Hot reload for changes; test auth flows.

5. **Linting and Formatting**:
   ```
   npm run lint  # ESLint
   npm run format  # Prettier
   ```
   - VS Code: Use extensions for Tailwind, TypeScript.

6. **Build and Preview**:
   ```
   npm run build
   npm run start  # Production preview
   ```

## Component Structure

Components are organized by feature in `components/`, using Radix UI for primitives and Tailwind for styling.

- **UI Primitives** (`components/ui/`): Reusable (DataTable, Card, Dialog).
  - Extend shadcn/ui: `npx shadcn-ui add button`.
- **Feature Components** (`components/editor/`, `components/agents/`): Editor-specific (CodeEditor), agent UI (ChatInterface).
- **Layout** (`components/layout/`): AppShell, Sidebar, Header.

Example component:
```tsx
// components/ui/DataTable.tsx
import { DataTable } from "@/components/ui/data-table"

interface Task {
  id: string
  status: "pending" | "completed"
}

export function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <DataTable
      columns={columns}
      data={tasks}
      filter="status"
    />
  )
}
```

Use TypeScript for props; colocation for related files.

## API Integration

Use React Query for data fetching/mutations, Axios for HTTP.

- **Services** (`lib/services/`): Abstract API calls.
  Example:
  ```ts
  // lib/services/MetaMCPClient.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import axios from 'axios'

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

  export function useCreateTask() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (task: TaskCreate) => api.post('/tasks', task).then(res => res.data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
    })
  }

  export function useTasks() {
    return useQuery({
      queryKey: ['tasks'],
      queryFn: () => api.get('/tasks/history').then(res => res.data)
    })
  }
  ```

- **Hooks**: Custom hooks for auth, projects.
  - `useAuth`: From NextAuth, integrates with Zustand.
  - Invalidate queries on mutations for caching.

Add auth headers: Interceptor with JWT from session.

## Editor Setup

Monaco Editor for code editing, integrated with file services.

1. **Installation**:
   - Already in deps: `@monaco-editor/react`.

2. **Implementation** (`components/editor/CodeEditor.tsx`):
   ```tsx
   import Editor from '@monaco-editor/react'
   import { useAppStore } from '@/store/useAppStore'

   export function CodeEditor({ filePath }: { filePath: string }) {
     const { openFiles, updateFile } = useAppStore()
     const content = openFiles[filePath] || ''

     return (
       <Editor
         height="100vh"
         language="typescript"  // Detect from extension
         value={content}
         onChange={(value) => updateFile(filePath, value || '')}
         options={{ minimap: { enabled: false }, fontSize: 14 }}
       />
     )
   }
   ```

3. **Integration**:
   - FileTree: Recursive fetch from GitHubService.getRepoStructure().
   - Tabs: State in Zustand for open files.
   - Diff: Use `react-diff-viewer` for changes.

Supports themes, linting (via MCP for Tree-sitter).

## State Management

- **Zustand**: Global (user, projects, editor state).
  - Stores: `useAuthStore`, `useProjectStore`, `useEditorStore`.
  - Persist: Middleware for localStorage (session).

- **React Query**: Server state (tasks, MCPs).
  - Cache: Stale time 5min for lists, infinite for live tasks.
  - Optimistic updates: For commits.

Example Zustand with persist:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      setProjects: (projects) => set({ projects }),
    }),
    { name: 'project-storage' }
  )
)
```

## Testing Frontend

From plans: Vitest for units, RTL for integration, Playwright for E2E.

1. **Unit Tests** (`__tests__/components/`):
   ```
   npm test
   ```
   Example:
   ```ts
   import { render, screen } from '@testing-library/react'
   import { CodeEditor } from '@/components/editor/CodeEditor'

   test('renders editor', () => {
     render(<CodeEditor filePath="/test.ts" />)
     expect(screen.getByRole('textbox')).toBeInTheDocument()
   })
   ```

2. **Integration Tests** (RTL):
   - Test hooks: `@testing-library/react-hooks`.
   - Mock API: MSW for endpoints.

3. **E2E Tests** (Playwright):
   ```
   npx playwright test
   ```
   - Tests: Login, create project, generate code.
   - Coverage: Core flows (onboarding, task execution).

4. **Coverage**:
   - `npm run test:cov` (>70% target).
   - CI: GitHub Actions for build/test.

Mock backend with MSW; test auth flows with test accounts.

For MCP dev: [MCP Development](mcp-development.md). Extending: [Extending](extending.md).

Back to [Developer Docs](index.md).