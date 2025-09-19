I'll fetch those files to understand the adjustments needed for the development plan.# 🚀 Vibe Coding Tool - Adjusted Development Instructions

## 📋 Executive Summary

**Key Changes from Original Plan:**
- Replace most custom MCPs with off-the-shelf solutions and lightweight wrappers
- Implement split-processing architecture (Oracle orchestrator + User HF Space workers)
- Several components already built and ready for integration
- More realistic cost and performance expectations

**Already Built Components:**
- MetaMCP Registry with routing flags
- HF Space Worker Template (reference pattern for heavy compute)
- Seeding Orchestrator MCP (reference pattern for multi-backend orchestration)
- GitHub File-Seek MCP Wrapper (reference pattern for lightweight wrappers)
- kglab GKG Ingest Adapter
- Libraries.io MCP Server
- Job signing/verification system
- Preflight consent flow

---

## 🏗️ Architecture Overview (Adjusted)

### Split-Processing Model

```
Oracle VPS (Orchestrator)          User HF Space (Workers)
┌─────────────────────────┐       ┌─────────────────────────┐
│ Lightweight MCPs        │       │ Heavy Compute MCPs      │
│ ├─ API Wrappers        │  ←→   │ ├─ Tree-sitter         │
│ ├─ Routing Logic       │       │ ├─ Semgrep             │
│ ├─ Job Signing         │       │ ├─ kglab               │
│ └─ Result Caching      │       │ └─ Coverage Analysis   │
└─────────────────────────┘       └─────────────────────────┘
```

### Routing Flags in MetaMCP Registry

```json
{
  "mcp_name": "example-mcp",
  "can_run_on_user_space": true,
  "result_pointer_preferred": true,
  "fallback_to_oracle": false
}
```

---

## 🔄 Off-the-Shelf MCP Replacements

### High Confidence Replacements (Use These)

| Original Custom MCP | Off-the-Shelf Solution | Implementation |
|---------------------|------------------------|-----------------|
| GitHub MCP | [Official GitHub MCP](https://github.com/github/mcp) | Direct use |
| Semgrep MCP | [semgrep/mcp](https://github.com/semgrep/mcp) | Deploy to HF Space |
| Tree-sitter MCP | [wrale/mcp-server-tree-sitter](https://github.com/wrale/mcp-server-tree-sitter) | Deploy to HF Space |
| Prisma MCP | [Prisma MCP](https://github.com/prisma/mcp) (Node/TS projects) | Direct use |
| Django MCP | [Django MCP](https://github.com/django/mcp) (Python projects) | Direct use |
| pytest MCP | [mcp_pytest_service](https://github.com/example/mcp_pytest_service) | Community version |
| Cloudflare MCP | [Official Cloudflare MCP](https://github.com/cloudflare/mcp) | Wrapper needed |

### Keep as Custom (Already Built or Essential)

| Custom MCP | Status | Rationale |
|------------|--------|-----------|
| Libraries.io MCP | ✅ Built | No equivalent breadth in off-the-shelf |
| kglab Adapter | ✅ Built | Knowledge graph specificity |
| Seeding Orchestrator | ✅ Built | Multi-ORM unification |
| GitHub File-Seek Wrapper | ✅ Built | Specialized search needs |

---

## 📦 Already Built Components

### 1. HF Space Worker Template
**Location:** `hfspace-worker-template/`  
**Purpose:** Reference pattern for all heavy compute MCPs  
**Features:**
- Signed job verification (RS256 JWT)
- Capability probes
- Pointer-based results (HF datasets)
- Callback support
- Ready for kglab/semgrep/tree-sitter pipelines

### 2. Seeding Orchestrator MCP
**Location:** `seeding-orchestrator-mcp/`  
**Purpose:** Unified database seeding across frameworks  
**Supported:**
- Prisma DB seed
- Django loaddata
- Alembic migrations
- Extensible for other ORMs

### 3. GitHub File-Seek MCP Wrapper
**Location:** `github-file-seek-mcp-wrapper/`  
**Purpose:** Pattern for lightweight Oracle-hosted wrappers  
**Features:**
- FastAPI-based
- Minimal manifest
- Environment-based auth
- Efficient file search/download

### 4. kglab GKG Ingest Adapter
**Location:** `kglab-gkg-ingest-adapter/`  
**Purpose:** Knowledge graph operations  
**Features:**
- Ingestion from repos
- SPARQL queries
- Export formats (JSON/TTL)
- Entity/relation extraction

### 5. Libraries.io MCP Server
**Location:** [ThatsRight-ItsTJ/libraries-io-mcp-server](https://github.com/ThatsRight-ItsTJ/libraries-io-mcp-server)  
**Purpose:** Package ecosystem analysis  
**Features:**
- Package discovery
- Dependency analysis
- Security checks
- Ecosystem insights

---

## 🎯 Development Priorities (Updated)

### Sprint 1: Integration (Week 1-2)
**Goal:** Deploy and integrate all off-the-shelf MCPs

- [ ] Deploy Semgrep MCP to HF Space using template
- [ ] Deploy Tree-sitter MCP to HF Space using template
- [ ] Integrate Official GitHub MCP
- [ ] Update `metamcp_registry.json` with routing flags
- [ ] Test orchestrator routing between Oracle and HF Spaces

### Sprint 2: Remaining Wrappers (Week 3-4)
**Goal:** Build lightweight Oracle-hosted wrappers

- [ ] **Cloudflare MCP Wrapper** (follow GitHub File-Seek pattern)
  - DNS, KV, R2, Workers API
  - FastAPI + minimal manifest
  - Environment-based auth
- [ ] **Multi-provider AI Proxy** (lightweight orchestrator)
  - Route to Pollinations, HF, OpenAI
  - Unified interface
  - Rate limiting per provider

### Sprint 3: Heavy Compute MCPs (Week 5-6)
**Goal:** Extend HF Space template for remaining heavy MCPs

- [ ] **Coverage Aggregator MCP**
  - Wrap coverage.py, nyc, JaCoCo
  - Normalize outputs to JSON
  - Pointer-based results
- [ ] **Custom NLP/ML MCPs** (as needed)
  - Summarization pipelines
  - Classification tasks
  - Domain-specific processing

### Sprint 4: Production Hardening (Week 7-8)
**Goal:** Finalize infrastructure and deployment

- [ ] Complete fallback Oracle worker integration
- [ ] HF Space automated deployment scripts
- [ ] Capability probes for all MCPs
- [ ] Consent flow implementation
- [ ] Rate limiting and quota management
- [ ] Monitoring and logging setup

---

## 🔧 Implementation Patterns

### Pattern 1: Lightweight Wrapper (Oracle-hosted)
```python
# Reference: github-file-seek-mcp-wrapper
# Use for: API proxies, simple operations
# Memory: < 100MB
# Location: Oracle VPS

from fastapi import FastAPI
from mcp import Tool, MCPServer

# Minimal implementation
# No heavy processing
# Quick response times
# API key management
```

### Pattern 2: Heavy Compute MCP (HF Space)
```python
# Reference: hfspace-worker-template
# Use for: AST parsing, KG generation, analysis
# Memory: 500MB-2GB
# Location: User's HF Space

from fastapi import FastAPI
import jwt
from huggingface_hub import HfApi

# Job signing verification
# Pointer-based results
# Callback support
# Heavy processing pipelines
```

### Pattern 3: Multi-Backend Orchestrator
```python
# Reference: seeding-orchestrator-mcp
# Use for: Unified interfaces across tools
# Memory: < 200MB
# Location: Either Oracle or HF Space

def detect_framework(project_path):
    # Detect Prisma, Django, Alembic, etc.
    pass

def route_to_appropriate_tool(framework, command):
    # Dispatch to correct backend
    pass
```

---

## 💰 Realistic Cost & Performance Expectations

### Adjusted Expectations

**Costs (Not Actually $0):**
- Oracle Free Tier: Limited bandwidth, may need upgrades
- HF Spaces: Free tier has quotas, startup delays
- API Rate Limits: GitHub, Cloudflare, HF all have limits
- Expect: $10-50/month at moderate scale

**Performance:**
- Light operations: < 5 seconds ✅
- Heavy operations (KG generation): 30-60 seconds
- Cold starts (HF Spaces): 15-30 seconds
- Implement async jobs for long operations

**Concurrency:**
- Oracle instance: 50-100 light requests
- Per HF Space: 5-10 heavy operations
- Use queue system for heavy tasks

---

## 🔐 Authentication & Permissions (Corrected)

### GitHub OAuth
```yaml
Minimal Scopes:
  - public_repo     # For public repos only
  - repo            # For private repos (if needed)
  - workflow        # For GitHub Actions
  - user:email      # User identification

Progressive Enhancement:
  - Start with minimal scopes
  - Request additional permissions as needed
  - Store tokens securely (encrypted)
```

### HuggingFace OAuth
```yaml
Current Scopes (verify with HF docs):
  - read            # Read repos/datasets
  - write           # Create/update content
  - inference-api   # Use models

Space Deployment:
  - May require separate deployment token
  - Test exact permissions needed
  - Document required scopes precisely
```

---

## 🚀 Deployment Checklist

### Oracle VPS Setup
- [ ] ARM instance (24GB RAM, 4 vCPU)
- [ ] Docker + Docker Compose
- [ ] MetaMCP orchestrator
- [ ] Lightweight MCPs only
- [ ] SSL/TLS with Let's Encrypt
- [ ] Rate limiting (Redis)
- [ ] Monitoring (Prometheus/Grafana)

### User HF Space Template
- [ ] Auto-deployment script
- [ ] Heavy compute MCPs
- [ ] Job verification system
- [ ] Pointer-based results
- [ ] Health check endpoints
- [ ] Cleanup scripts

### Frontend (Vercel)
- [ ] OAuth integrations
- [ ] MetaMCP client
- [ ] Monaco Editor
- [ ] Agent selector UI
- [ ] KG visualization
- [ ] Error handling

---

## 📊 Success Metrics (Realistic)

### Technical
- Uptime: > 95% (accounting for HF Space cold starts)
- Light operation response: < 5s
- Heavy operation completion: < 2 minutes
- Error rate: < 5%

### User Experience
- Onboarding: < 10 minutes
- First project creation: < 15 minutes
- Code generation accuracy: > 80%
- User retention: > 30% weekly active

### Business
- Infrastructure cost: < $50/month
- User capacity: 100-500 active users
- Community contributions: 5+ agent templates/month

---

## 🎯 Immediate Next Steps

1. **Deploy existing components:**
   - Set up Oracle VPS with MetaMCP orchestrator
   - Deploy built MCPs to test HF Space
   - Verify routing and job signing

2. **Complete Sprint 1 integration:**
   - Deploy off-the-shelf MCPs
   - Update registry with routing flags
   - Test end-to-end flow

3. **Build Cloudflare wrapper:**
   - Follow GitHub File-Seek pattern
   - Test with sample deployments
   - Document API usage

4. **Create user onboarding flow:**
   - OAuth setup
   - HF Space auto-deployment
   - Initial project creation

---

## 📝 Key Learnings & Adjustments

**What's Working:**
- Split-processing architecture (Oracle + HF Spaces)
- Off-the-shelf MCP integration strategy
- Pointer-based results for large data
- Job signing for security

**What Needs Adjustment:**
- Not truly $0 hosting - expect some costs
- Performance targets were optimistic
- HF OAuth scopes need verification
- Rate limits require careful management

**Critical Success Factors:**
- Robust error handling and retries
- Clear user expectations about performance
- Progressive enhancement of features
- Strong community engagement for templates

---

## 🎊 Realistic End Goal

A production-ready AI coding platform that:
- Minimizes infrastructure costs (< $50/month)
- Leverages user-owned compute (HF Spaces)
- Prevents hallucination through knowledge graphs
- Provides professional development experience
- Scales to hundreds of active users

**Remember:** Start with core functionality, iterate based on user feedback, and progressively enhance rather than trying to build everything at once.
