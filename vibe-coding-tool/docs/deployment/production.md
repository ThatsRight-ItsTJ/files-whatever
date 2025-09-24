# Production Deployment

Deploying the Vibe Coding Tool to production involves scaling the backend orchestrator, securing with SSL, and integrating monitoring. Recommended for production: Oracle Cloud for backend (low-cost VPS), Vercel for frontend, HF Spaces for MCPs. This guide covers Oracle Cloud setup, SSL/TLS, and monitoring with Grafana.

Prerequisites: Basic Docker knowledge, domain for SSL, accounts for cloud services.

## Oracle Cloud Setup

Oracle Cloud is recommended for the backend due to its free tier and reliability for the orchestrator.

1. **Create Instance**:
   - Sign up at oracle.com/cloud.
   - Launch Compute Instance: Ubuntu 22.04, t2.micro (free-eligible), 1 OCPU/1GB RAM.
   - SSH key: Add public key during launch.
   - Firewall: Open TCP 22 (SSH), 80/443 (HTTP/HTTPS), 8000 (API, temporary).

2. **SSH and Prepare**:
   ```
   ssh ubuntu@your-instance-ip -i your_private_key.pem
   sudo apt update && sudo apt upgrade -y
   sudo apt install docker docker-compose -y
   sudo usermod -aG docker $USER  # Add to docker group
   newgrp docker  # Or log out/in
   ```

3. **Transfer Code**:
   - Clone repo on local, tar, scp to instance:
     ```
     tar -czf vibe.tar.gz vibe-coding-tool/
     scp -i your_private_key.pem vibe.tar.gz ubuntu@your-instance-ip:~/
     ```
   - On instance: `tar -xzf vibe.tar.gz && cd vibe-coding-tool/orchestrator`.

4. **Environment and Secrets**:
   - Copy `.env.example` to `.env.prod`:
     ```
     cp .env.example .env.prod
     ```
   - Edit .env.prod:
     ```
     DEBUG=false
     LOG_LEVEL=INFO
     DATABASE_URL=postgresql://postgres:prodpass@prod-db-host:5432/vibe_coding_tool
     REDIS_URL=redis://prod-redis:6379/0
     JWT_SECRET=prod-secret-key
     GITHUB_CLIENT_ID=prod-github-id
     GITHUB_CLIENT_SECRET=prod-github-secret
     HF_CLIENT_ID=prod-hf-id
     HF_CLIENT_SECRET=prod-hf-secret
     ALLOWED_ORIGINS=https://yourdomain.com
     # Production: Add NGINX_CONF, CERTS_PATH
     ```
   - Use secure secrets management (e.g., OCI Vault) instead of .env for prod.
   - For DB: Use RDS or managed PostgreSQL; update URL.

5. **Build and Run**:
   - Build image: `docker build -t vibe-orchestrator:prod .`
   - Use production compose:
     ```
     docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
     ```
   - Includes NGINX for reverse proxy, SSL termination.
   - Migrations: `docker compose exec app alembic upgrade head`.

6. **Configure NGINX for SSL/TLS**:
   - Generate certs (or use Let's Encrypt):
     ```
     sudo mkdir -p /etc/nginx/certs
     sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/server.key -out /etc/nginx/certs/server.crt
     ```
   - Edit `docker-compose.prod.yml` volumes for certs.
   - NGINX config (`nginx.conf` in compose):
     ```
     server {
         listen 443 ssl;
         server_name yourdomain.com;
         ssl_certificate /etc/nginx/certs/server.crt;
         ssl_certificate_key /etc/nginx/certs/server.key;
         location / {
             proxy_pass http://app:8000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
         }
     }
     ```
   - Update DNS A record to instance IP.
   - Restart: `docker compose -f docker-compose.prod.yml up -d nginx`.

7. **Verify**:
   - API: https://yourdomain.com/docs (SSL).
   - Logs: `docker compose logs nginx app`.
   - Health: https://yourdomain.com/health.

## Production Environment

- **Scaling**: Use docker-compose scale or Kubernetes for multiple app instances.
  - Queue workers: Scale RQ workers via env MAX_CONCURRENT_JOBS.
  - Load Balancer: NGINX or cloud LB in front of multiple orchestrators.

- **Database Production**:
  - Use managed PostgreSQL (e.g., OCI DB) for high availability.
  - Backup: Configure automated snapshots.
  - Connection: Update DATABASE_URL with prod credentials.

- **Security**:
  - SSL/TLS: Enforce HTTPS; use certbot for auto-renewal.
  - Secrets: Use OCI Vault or Kubernetes Secrets; avoid .env in prod.
  - Firewall: UFW/OCI Security List – open 443 only, restrict SSH.
  - Rate Limiting: Lower limits for prod (e.g., 50 req/min per user).
  - Secrets Rotation: Script to rotate JWT_SECRET, OAuth secrets.

- **Monitoring (Grafana)**:
  - Included in docker-compose; access at https://yourdomain.com:3000 (admin/admin).
  - Dashboards: System overview, API latency, queue depth, MCP health.
  - Prometheus: Exposed at /metrics; add alerts for >5% error rate.

- **Scaling and Monitoring**:
  - Prometheus/Grafana: For metrics (request latency, job success).
  - Logs: Centralized with ELK if scaled.
  - Scaling: Docker Swarm or Kubernetes for multi-instance.

For HF MCPs: [HF Spaces](hf-spaces.md). CI/CD: [CI/CD](ci-cd.md).

Back to [Deployment Index](index.md).