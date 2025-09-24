# GitHub Integration

The Vibe Coding Tool integrates with GitHub for repository management, file operations, and version control. This allows seamless project creation, commits from AI edits, and fetching code for MCP analysis. Uses OAuth for auth and the GitHub API via the backend GitHubService.

From the backend plan, GitHubService handles CRUD for repos and files, routed through tasks.

## Setup

1. **GitHub App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App.
   - Homepage URL: Your app URL (e.g., http://localhost:3000).
   - Authorization callback URL: http://localhost:3000/auth/github/callback (dev) or https://yourdomain.com/auth/github/callback (prod).
   - Scopes: repo (full control), user (profile).
   - Note Client ID and Secret.

2. **Configure in Vibe**:
   - Add to .env:
     ```
     GITHUB_CLIENT_ID=your-client-id
     GITHUB_CLIENT_SECRET=your-client-secret
     GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
     ```
   - Restart backend/frontend.

3. **Link Account**:
   - In app: Dashboard > Settings > "Connect GitHub".
   - Or API: POST /api/user/link-account {provider: "github", code: "from-oauth"}.
   - Grant permissions; backend stores token in oauth_accounts.

## Features

- **Repository Creation**: Auto-create repos on project setup.
- **File Operations**: Fetch structure, read/write files, commit changes.
- **Diff and History**: View git diffs, timelines in UI.
- **PR Management**: Create branches/PRs from AI suggestions.

Powered by GitHub File-Seek MCP wrapper for efficient ops.

## Usage

### Create Repo (Project Creation)
- In UI: New Project > Enable "Create GitHub Repo".
- Backend calls GitHubService.create_repo({name, description}).
- Result: Repo URL in project details; initial commit with scaffold.

Example API:
```
POST /api/projects
{
  "name": "my-app",
  "description": "AI Todo App",
  "template": "nextjs"
}
```
Response includes "repository_url": "https://github.com/user/my-app".

### File Operations
- **Fetch Structure**: On project load, GET /api/projects/{id} includes files from GitHub MCP.
- **Read File**: Editor loads content via service.
- **Write/Commit**: On save, POST /api/projects/{id}/files {path, content} → commit.
- **Search Files**: Task "file_search" uses GitHub MCP; query via UI or API.

Example: Commit AI change
```
PUT /api/projects/{id}/files
{
  "path": "src/TodoList.tsx",
  "content": "updated code",
  "message": "AI: Add todo functionality"
}
```

### Advanced

- **Import Repo**: Dashboard > "Import from GitHub" – fetches structure, creates project.
- **Branch/PR**: Tools > "Create PR" – generates branch, opens PR with diff.
- **Webhook**: Optional for real-time sync (setup in GitHub repo settings).

## Troubleshooting

- **Auth Errors**: Invalid scopes? Re-authorize with repo:write.
- **Rate Limits**: GitHub API limits (5000/hr); tool retries.
- **Private Repos**: Ensure token has access; public for testing.
- **Large Repos**: Lazy load files; use MCP for efficient search.

For custom GitHub wrappers: See [Extending](../developer/extending.md#custom-integrations).

Back to [Integrations](index.md).