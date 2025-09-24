# Integrations

The Vibe Coding Tool integrates with external services for repository management, model hosting, edge computing, and more. This section covers setup and usage for key integrations: GitHub for version control, Hugging Face for MCP Spaces and datasets, Cloudflare for edge services, and other tools like Libraries.io.

Integrations are handled via backend services (e.g., GitHubService) and require OAuth setup. See [Authentication](../api/authentication.md) for tokens.

## Sections

- **[GitHub](github.md)**: Repository creation, file operations, OAuth setup.
- **[Hugging Face](huggingface.md)**: Spaces deployment, dataset storage, model inference.
- **[Cloudflare](cloudflare.md)**: DNS, KV, R2, Workers integration via MCP wrapper.
- **[Other Integrations](other.md)**: Libraries.io for dependencies, additional services.

## Setup Overview

1. **OAuth**: Configure apps in service dashboards (GitHub, HF, Cloudflare).
2. **Tokens**: Add Client ID/Secret to .env (GITHUB_CLIENT_ID, etc.).
3. **Backend**: Services in `services/` handle API calls.
4. **Frontend**: UI buttons for auth/link (e.g., "Connect GitHub").

For custom: See [Extending](../developer/extending.md#custom-integrations).

Back to main docs.