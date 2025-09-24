# Getting Started with Vibe Coding Tool

Welcome to the Vibe Coding Tool, a sophisticated MetaMCP orchestrator system designed to streamline AI-assisted coding workflows through intelligent task routing, knowledge graph management, and seamless integrations with external services like GitHub and Hugging Face.

This guide provides everything you need to get up and running quickly, from prerequisites to your first project.

## Who is This For?

The Vibe Coding Tool serves multiple user roles:
- **End Users**: Developers seeking AI-powered code generation, multi-file editing, and interactive knowledge graphs.
- **Developers**: Builders extending the system with custom MCPs or integrations.
- **System Administrators**: Those deploying and maintaining the orchestrator on local or cloud infrastructure.
- **MCP Server Developers**: Creators of specialized MCPs for heavy compute tasks in Hugging Face Spaces.
- **DevOps Engineers**: Experts scaling the system with monitoring and CI/CD pipelines.

Whether you're onboarding a new project or integrating advanced AI agents, this tool supports your entire coding journey.

## Prerequisites

Before installing, ensure you have:
- **Python 3.11+**: For the FastAPI backend orchestrator.
- **Node.js 18+**: For the Next.js frontend.
- **Docker 20.10+ and Docker Compose 2.0+**: Recommended for easy setup and MCP deployments.
- **Git**: For cloning repositories and managing projects.
- **GitHub Account**: For OAuth authentication and repository operations.
- **Hugging Face Account**: For deploying MCPs to Spaces and dataset management.
- **PostgreSQL 15+ and Redis 7+**: For persistent storage and queuing (Docker images provided).

Hardware: At least 4GB RAM for local development; more for heavy MCP tasks.

For production, consider Oracle Cloud or similar for the orchestrator backend.

## Installation Overview

The Vibe Coding Tool consists of:
1. **Backend Orchestrator**: FastAPI server handling task routing and MCP registry (deployed via Docker).
2. **Frontend Application**: Next.js app for UI, editor, and KG visualization (deployed to Vercel or locally).
3. **MCP Servers**: Built-in and custom MCPs (e.g., GitHub wrapper, Semgrep) deployed to Hugging Face Spaces or locally.

See [Installation Guide](installation.md) for detailed steps, including environment variables and Docker Compose setup.

## First Steps

1. **Clone the Repository**:
   ```
   git clone https://github.com/ThatsRight-ItsTJ/vibe-coding-tool.git
   cd vibe-coding-tool
   ```

2. **Set Up the Backend**:
   - Copy `.env.example` to `.env` in the `orchestrator/` directory and configure secrets (e.g., JWT_SECRET, GitHub/HF OAuth keys).
   - Run `docker-compose up -d` to start PostgreSQL, Redis, and the orchestrator.

3. **Deploy the Frontend**:
   - In the root, run `npm install` and `npm run dev` for local development.
   - For production, deploy to Vercel with environment variables like NEXT_PUBLIC_API_URL.

4. **Deploy Initial MCPs**:
   - Use the HF Space Worker Template to deploy built-in MCPs like Semgrep or Tree-sitter.
   - Update the MCP registry (`metamcp_registry.json`) with routing flags.

5. **Access the Application**:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Authenticate via GitHub or Hugging Face OAuth.

Once set up, create your first project via the UI to experience code generation and KG building. For common issues, see [Troubleshooting](troubleshooting.md).

## Navigation

- [Quickstart](quickstart.md): Step-by-step to run your first task.
- [Installation](installation.md): Full setup instructions.
- [Troubleshooting](troubleshooting.md): Resolve setup issues.

For deeper dives:
- [Architecture Overview](../architecture/overview.md)
- [User Guides](../user-guides/index.md)
- [API Reference](../api/index.md)

Join our community on GitHub for support and contributions!