# Vibe Coding Tool - Backend Orchestrator Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Vibe Coding Tool backend orchestrator. The orchestrator is built with FastAPI, Python 3.11+, and includes support for PostgreSQL, Redis, JWT authentication, and MCP server integration.

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended for production)
- **Storage**: 50GB+ SSD
- **Network**: Internet connection for external API access

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **Python**: 3.11+ (for local development)

### Environment Variables
Create a `.env` file in the orchestrator directory with the following variables:

```bash
# Application Settings
DEBUG=false
LOG_LEVEL=INFO
APP_NAME="Vibe Coding Tool - MetaMCP Orchestrator"
APP_VERSION="1.0.0"

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/vibe_coding_tool
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis Configuration
REDIS_URL=redis://redis:6379/0
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

# External API Tokens
GITHUB_TOKEN=your-github-personal-access-token
SEMGREP_TOKEN=your-semgrep-api-token
LIBRARIES_IO_TOKEN=your-libraries-io-api-token
NETLIFY_TOKEN=your-netlify-api-token
```

## Deployment Options

### 1. Local Development Deployment

#### Using Docker Compose
```bash
# Clone the repository
git clone <repository-url>
cd vibe-coding-tool/orchestrator

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### Manual Installation
```bash
# Install system dependencies
sudo apt update
sudo apt install -y python3.11 python3.11-venv postgresql redis-server

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Run database migrations
alembic upgrade head

# Start the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Production Deployment

#### Using Docker Compose
```bash
# Clone the repository
git clone <repository-url>
cd vibe-coding-tool/orchestrator

# Copy environment template
cp .env.example .env

# Edit .env file with production configuration
nano .env

# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f app
```

#### Using Kubernetes
```bash
# Install Kubernetes cluster
# (Follow your cloud provider's instructions)

# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n vibe-coding-tool

# View logs
kubectl logs -f deployment/vibe-coding-tool-orchestrator -n vibe-coding-tool
```

#### Using Cloud Provider (AWS/GCP/Azure)
```bash
# Deploy using Terraform
cd terraform/
terraform init
terraform plan
terraform apply

# Or using CloudFormation/Azure Resource Manager
# (Follow your cloud provider's instructions)
```

## Configuration

### Database Configuration
```sql
-- Create database
CREATE DATABASE vibe_coding_tool;

-- Create user
CREATE USER vibe_user WITH PASSWORD 'your_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vibe_coding_tool TO vibe_user;

-- Connect to database and run migrations
\c vibe_coding_tool
\i database/init.sql
```

### Redis Configuration
```bash
# Redis configuration file (/etc/redis/redis.conf)
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Nginx Configuration
```nginx
# /etc/nginx/nginx.conf
upstream app {
    server app:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /metrics {
        proxy_pass http://app:8090/metrics;
        proxy_set_header Host $host;
    }
}
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vibe-coding-tool'
    static_configs:
      - targets: ['app:8000']
    metrics_path: /metrics
```

### Grafana Dashboards
1. Access Grafana at `http://localhost:3000`
2. Login with admin/admin
3. Import pre-configured dashboards:
   - FastAPI Dashboard
   - PostgreSQL Dashboard
   - Redis Dashboard
   - System Metrics Dashboard

### Logging Configuration
```python
# config/logging.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # File handler
    handler = RotatingFileHandler(
        '/app/logs/orchestrator.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    logger.addHandler(handler)
```

## Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure Nginx for HTTPS
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Configuration
```bash
# UFW Firewall
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5432/tcp    # PostgreSQL
sudo ufw allow 6379/tcp    # Redis
sudo ufw enable
```

### Security Headers
```nginx
# Security headers in Nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
```

## Backup and Recovery

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U postgres vibe_coding_tool > /backups/backup_$DATE.sql

# Schedule daily backup
0 2 * * * /path/to/backup_script.sh
```

### Redis Backup
```bash
# Create Redis backup
docker exec redis redis-cli --rdb /data/dump.rdb

# Restore Redis backup
docker exec redis redis-cli --rdb /data/dump.rdb
```

### File System Backup
```bash
# Backup application files
tar -czf /backups/app_backup_$(date +%Y%m%d).tar.gz /app

# Backup configuration files
tar -czf /backups/config_backup_$(date +%Y%m%d).tar.gz /app/config
```

## Scaling and Performance

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  app:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Load Balancing
```nginx
# Load balancer configuration
upstream app {
    least_conn;
    server app1:8000 weight=3;
    server app2:8000 weight=2;
    server app3:8000 weight=1;
}
```

### Database Scaling
```sql
-- Create read replica
CREATE DATABASE vibe_coding_tool_replica;

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
```

### Caching Strategy
```python
# Redis caching configuration
CACHE_CONFIG = {
    'default_timeout': 300,
    'key_prefix': 'vibe:',
    'hash_key': 'vibe_cache'
}
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d vibe_coding_tool

# Check database connections
SELECT count(*) FROM pg_stat_activity;
```

#### Redis Connection Issues
```bash
# Check Redis status
docker-compose logs redis

# Connect to Redis
docker-compose exec redis redis-cli ping

# Check Redis memory usage
docker-compose exec redis redis-cli info memory
```

#### Application Issues
```bash
# Check application logs
docker-compose logs app

# Check application health
curl http://localhost:8000/health

# Check application metrics
curl http://localhost:8000/metrics
```

### Performance Issues

#### Slow Database Queries
```sql
-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Analyze table
ANALYZE TABLE users;
ANALYZE TABLE projects;
ANALYZE TABLE tasks;
```

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Check application memory
curl http://localhost:8000/metrics | grep memory

# Restart application if needed
docker-compose restart app
```

### Security Issues

#### Unauthorized Access
```bash
# Check authentication logs
docker-compose logs app | grep "authentication"

# Check JWT tokens
docker-compose logs app | grep "jwt"
```

#### Rate Limiting Issues
```bash
# Check rate limiting logs
docker-compose logs app | grep "rate_limit"

# Adjust rate limiting settings
# Edit .env file and restart
```

## Maintenance

### Regular Tasks

#### Daily Tasks
```bash
# Check service health
docker-compose ps

# Check disk space
df -h

# Check log sizes
du -sh /app/logs/
```

#### Weekly Tasks
```bash
# Rotate logs
logrotate -f /etc/logrotate.d/vibe-coding-tool

# Update packages
docker-compose pull

# Run database maintenance
docker-compose exec postgres vacuumdb -U postgres -a -z
```

#### Monthly Tasks
```bash
# Create full backup
./backup_full.sh

# Update SSL certificates
./renew_ssl.sh

# Review security settings
./security_audit.sh
```

### Update Procedures

#### Application Update
```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Restart application
docker-compose restart app
```

#### System Update
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# Update Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Support

### Getting Help
- **Documentation**: [Link to documentation]
- **Issues**: [Link to GitHub issues]
- **Community**: [Link to community forum]
- **Email**: support@vibe-coding-tool.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.