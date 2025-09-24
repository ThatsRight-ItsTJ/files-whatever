# Deployment Guide

This section covers deploying the Vibe Coding Tool to various environments, from local development to production. Deployment involves the backend orchestrator, frontend, and MCPs. For basic setup, see [Local Deployment](local.md). For MCPs, see [MCP Servers](../mcps/index.md).

The tool uses Docker for consistency across environments. Production uses Oracle Cloud for backend, Vercel for frontend, and HF Spaces for MCPs.

## Sections

- **[Local Deployment](local.md)**: Docker Compose for development/testing.
- **[Production Deployment](production.md)**: Oracle Cloud setup, SSL, monitoring.
- **[HF Spaces Deployment](hf-spaces.md)**: Deploying MCPs to Hugging Face.
- **[CI/CD Pipelines](ci-cd.md)**: GitHub Actions for automation.

## Quick Start

For local: Follow [Getting Started](../getting-started/quickstart.md).

For production:
1. Backend: Docker on Oracle Cloud.
2. Frontend: Vercel.
3. MCPs: HF Spaces.

Prerequisites: Docker, accounts for GitHub/HF, cloud provider.

For full production, see [Production Deployment](production.md). Monitoring: Grafana/Prometheus.

Back to main docs.