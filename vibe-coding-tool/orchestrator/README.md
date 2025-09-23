# Vibe Coding Tool - Backend Orchestrator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)

The Vibe Coding Tool Backend Orchestrator is a powerful, production-ready backend service that manages MCP (Model Context Protocol) servers, handles task routing, and provides a comprehensive API for the Vibe Coding Tool ecosystem.

## 🚀 Features

### Core Services
- **FastAPI Backend**: High-performance async API with automatic documentation
- **Task Routing**: Intelligent routing based on MCP capabilities and resource requirements
- **Job Management**: Complete lifecycle management of tasks (create, execute, monitor, retry)
- **Result Management**: Efficient storage and retrieval of task results with pointer-based storage
- **MCP Registry**: Dynamic discovery and management of MCP servers
- **JWT Authentication**: Secure token-based authentication with scope management
- **OAuth Integration**: GitHub and HuggingFace OAuth support

### Database & Caching
- **PostgreSQL**: Persistent metadata storage with async support
- **Redis**: High-performance caching and queue management
- **RQ (Redis Queue)**: Background task processing with automatic retries

### External Integrations
- **GitHub API**: Repository management, file operations, webhook handling
- **HuggingFace API**: Space deployment, dataset management, model inference
- **Cloudflare API**: DNS, KV, R2, Workers integration
- **Libraries.io API**: Package discovery and dependency analysis

### Monitoring & Observability
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and dashboards
- **Structured Logging**: JSON-formatted logs with multiple outputs
- **Health Checks**: Comprehensive health monitoring for all services

### Security & Performance
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Input Validation**: Strict validation of all user inputs
- **Security Headers**: Comprehensive security headers
- **CORS Support**: Configurable CORS policies
- **Caching Strategy**: Multi-level caching for performance optimization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Next.js UI    │  │   Monaco Editor │  │   KG Visualizer │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                 MetaMCP Orchestrator Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   FastAPI       │  │   Task Router   │  │   Job Manager   │ │
│  │   Backend       │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Redis Queue   │  │   JWT Auth      │  │   MCP Registry  │ │
│  │   & Caching     │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Processing Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Lightweight    │  │   Heavy MCPs    │  │   GitHub MCP    │ │
│  │   MCPs          │  │   (HF Spaces)   │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Tree-sitter    │  │   Semgrep MCP   │  │   Cloudflare MCP │ │
│  │   MCP           │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Python 3.11+
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd vibe-coding-tool/orchestrator

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Manual Installation

```bash
# Clone the repository
git clone <repository-url>
cd vibe-coding-tool/orchestrator

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
nano .env

# Run database migrations
alembic upgrade head

# Start the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the orchestrator directory:

```bash
# Application Settings
DEBUG=false
LOG_LEVEL=INFO
APP_NAME="Vibe Coding Tool - MetaMCP Orchestrator"
APP_VERSION="1.0.0"

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/vibe_coding_tool
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_MAX_CONNECTIONS=100

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# HuggingFace OAuth Configuration
HF_CLIENT_ID=your-hf-client-id
HF_CLIENT_SECRET=your-hf-client-secret
HF_REDIRECT_URI=http://localhost:3000/auth/huggingface/callback

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ZONE_ID=your-cloudflare-zone-id

# Security Configuration
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Task Configuration
MAX_CONCURRENT_JOBS=10
DEFAULT_TASK_TIMEOUT=300
MAX_TASK_RETRIES=3

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=8090
```

### Database Setup

```sql
-- Create database
CREATE DATABASE vibe_coding_tool;

-- Create user
CREATE USER vibe_user WITH PASSWORD 'your_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vibe_coding_tool TO vibe_user;

-- Run migrations
alembic upgrade head
```

## 🚀 Usage

### API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`
- **Metrics**: `http://localhost:8000/metrics`

### Key API Endpoints

#### Task Management
```bash
# Create a new task
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "file_search",
    "priority": "normal",
    "input": {"query": "find all Python files"},
    "required_capabilities": ["file_operations"],
    "is_heavy": false
  }'

# Get task status
curl -X GET "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# List user tasks
curl -X GET "http://localhost:8000/api/tasks?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Project Management
```bash
# Create a new project
curl -X POST "http://localhost:8000/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Project",
    "description": "A sample project",
    "repository_url": "https://github.com/user/repo"
  }'

# Get project details
curl -X GET "http://localhost:8000/api/projects/{project_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### MCP Operations
```bash
# List available MCPs
curl -X GET "http://localhost:8000/api/mcps" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get MCP details
curl -X GET "http://localhost:8000/api/mcps/{mcp_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Execute MCP
curl -X POST "http://localhost:8000/api/mcps/{mcp_id}/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": {"query": "search files"}}'
```

#### User Management
```bash
# Get user profile
curl -X GET "http://localhost:8000/api/user/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Link GitHub account
curl -X POST "http://localhost:8000/api/user/link-account" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"provider": "github", "code": "github_oauth_code"}'
```

#### Knowledge Graph
```bash
# Generate knowledge graph
curl -X POST "http://localhost:8000/api/kg/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "project_id": "project_123",
    "source_data": {"files": ["file1.py", "file2.js"]}
  }'

# Get knowledge graph
curl -X GET "http://localhost:8000/api/kg/{kg_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Query knowledge graph
curl -X GET "http://localhost:8000/api/kg/{kg_id}/query?query=SELECT * FROM nodes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Agent Operations
```bash
# List agents
curl -X GET "http://localhost:8000/api/agents" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create agent
curl -X POST "http://localhost:8000/api/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Code Review Agent",
    "description": "Automated code review",
    "template_id": "code_review_template",
    "configuration": {"severity": "medium"}
  }'

# Execute agent
curl -X POST "http://localhost:8000/api/agents/{agent_id}/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": {"file": "main.py"}}'
```

## 📊 Monitoring

### Prometheus Metrics

The application exposes metrics at `/metrics`:

```bash
# View metrics
curl http://localhost:8000/metrics

# Key metrics:
# - http_requests_total: Total HTTP requests
# - http_request_duration_seconds: Request duration
# - active_jobs: Number of active jobs
# - completed_jobs: Number of completed jobs
# - failed_jobs: Number of failed jobs
```

### Grafana Dashboards

Access Grafana at `http://localhost:3000` (admin/admin):

1. **FastAPI Dashboard**: Request metrics and performance
2. **PostgreSQL Dashboard**: Database performance
3. **Redis Dashboard**: Cache and queue metrics
4. **System Dashboard**: Resource utilization

### Logging

Logs are written to `/app/logs/orchestrator.log`:

```bash
# View logs
tail -f /app/logs/orchestrator.log

# Filter logs
grep "ERROR" /app/logs/orchestrator.log
grep "auth" /app/logs/orchestrator.log
```

## 🔒 Security

### Authentication

The application uses JWT tokens for authentication:

```python
# Generate token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in requests
curl -X GET "http://localhost:8000/api/user/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Rate Limiting

Rate limiting is applied to all endpoints:

```bash
# Check rate limits
curl -I http://localhost:8000/api/tasks
```

### Security Headers

The application includes security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## 🚀 Deployment

### Production Deployment

```bash
# Using Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f k8s/

# Using Terraform
terraform apply
```

### Environment-Specific Configurations

- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Staging**: `docker-compose.staging.yml`

### Scaling

```bash
# Scale application
docker-compose up -d --scale app=3

# Scale with load balancer
docker-compose -f docker-compose.scale.yml up -d
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Test Coverage

```bash
# Generate coverage report
pytest --cov=. --cov-report=html

# View coverage
open htmlcov/index.html
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pytest`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd vibe-coding-tool/orchestrator

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install development dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Run linting
black .
isort .
flake8 .
mypy .
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Configuration Guide](./docs/configuration.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)
- [Contributing Guide](./docs/contributing.md)

## 🐛 Issues

If you encounter any issues, please report them on the [GitHub Issues](https://github.com/vibe-coding-tool/orchestrator/issues) page.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints.
- [SQLAlchemy](https://www.sqlalchemy.org/) - The Python SQL Toolkit and Object-Relational Mapping Library
- [Redis](https://redis.io/) - An open source (BSD licensed), in-memory data structure store
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation using Python type hints
- [Prometheus](https://prometheus.io/) - The leading monitoring and alerting toolkit for cloud-native applications

## 📞 Support

- **Documentation**: [Link to documentation]
- **Issues**: [Link to GitHub issues]
- **Community**: [Link to community forum]
- **Email**: support@vibe-coding-tool.com

---

Made with ❤️ by the Vibe Coding Tool Team