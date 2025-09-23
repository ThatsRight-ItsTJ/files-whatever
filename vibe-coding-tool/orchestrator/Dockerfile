# Multi-stage build for Vibe Coding Tool MetaMCP Orchestrator
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.minimal.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.minimal.txt

# Production stage
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create application directories
RUN mkdir -p /app /app/logs /app/data /app/config && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Create .env file if it doesn't exist
RUN if [ ! -f .env ]; then \
    echo "# Environment variables for Vibe Coding Tool" > .env; \
    echo "DEBUG=false" >> .env; \
    echo "DATABASE_URL=postgresql://user:password@postgres:5432/vibe_coding_tool" >> .env; \
    echo "REDIS_URL=redis://redis:6379/0" >> .env; \
    echo "JWT_SECRET=your-secret-key-here" >> .env; \
    echo "GITHUB_CLIENT_ID=your-github-client-id" >> .env; \
    echo "GITHUB_CLIENT_SECRET=your-github-client-secret" >> .env; \
    echo "HF_CLIENT_ID=your-hf-client-id" >> .env; \
    echo "HF_CLIENT_SECRET=your-hf-client-secret" >> .env; \
    fi

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]