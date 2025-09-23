#!/bin/bash

# ============================================
# Vibe Coding Tool - Complete Repository Clone Script
# This script verifies and clones all required repositories
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
SUCCESS=0
FAILED=0
SKIPPED=0

# Create main project directory
PROJECT_DIR="vibe-coding-tool"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_DIR}_clone_log_${TIMESTAMP}.txt"
REPORT_FILE="${PROJECT_DIR}_clone_report_${TIMESTAMP}.md"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vibe Coding Tool Repository Clone Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create project structure
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

mkdir -p core-components
mkdir -p custom-mcps
mkdir -p official-mcps
mkdir -p community-mcps
mkdir -p testing-mcps
mkdir -p database-mcps
mkdir -p deployment-mcps
mkdir -p cloudflare-mcps
mkdir -p frontend-deps
mkdir -p reference-repos
mkdir -p tools-sdks

# Initialize report
echo "# Vibe Coding Tool - Repository Clone Report" > ../$REPORT_FILE
echo "## Timestamp: $(date)" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

# Function to check if repository exists
check_repo_exists() {
    local repo_url=$1
    local repo_name=$2
    
    # Extract owner and repo name from URL
    local repo_path=$(echo $repo_url | sed 's/https:\/\/github.com\///' | sed 's/\.git$//')
    
    # Check if repository exists using git ls-remote
    if git ls-remote $repo_url HEAD &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to clone repository
clone_repo() {
    local repo_url=$1
    local target_dir=$2
    local repo_name=$3
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${YELLOW}[$TOTAL] Checking:${NC} $repo_name"
    echo "[$TOTAL] Checking: $repo_name" >> ../$LOG_FILE
    
    if check_repo_exists $repo_url $repo_name; then
        echo -e "${GREEN}✓ Repository exists${NC}"
        echo "  Cloning to: $target_dir"
        
        if [ -d "$target_dir/$repo_name" ]; then
            echo -e "${YELLOW}  → Directory exists, pulling latest...${NC}"
            cd "$target_dir/$repo_name"
            git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
            cd - > /dev/null
            SKIPPED=$((SKIPPED + 1))
            echo "  [UPDATED] $repo_url" >> ../$LOG_FILE
        else
            if git clone $repo_url "$target_dir/$repo_name" >> ../$LOG_FILE 2>&1; then
                echo -e "${GREEN}  ✓ Cloned successfully${NC}"
                SUCCESS=$((SUCCESS + 1))
                echo "  [SUCCESS] $repo_url" >> ../$LOG_FILE
                echo "- ✅ **$repo_name**: Cloned successfully" >> ../$REPORT_FILE
            else
                echo -e "${RED}  ✗ Clone failed${NC}"
                FAILED=$((FAILED + 1))
                echo "  [FAILED] $repo_url - Clone error" >> ../$LOG_FILE
                echo "- ❌ **$repo_name**: Clone failed" >> ../$REPORT_FILE
            fi
        fi
    else
        echo -e "${RED}✗ Repository does not exist or is private${NC}"
        FAILED=$((FAILED + 1))
        echo "  [NOT FOUND] $repo_url" >> ../$LOG_FILE
        echo "- ⚠️ **$repo_name**: Repository not found or private" >> ../$REPORT_FILE
    fi
    echo ""
}

# Function to clone with subdirectory
clone_repo_subdir() {
    local repo_url=$1
    local target_dir=$2
    local repo_name=$3
    local subdir=$4
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${YELLOW}[$TOTAL] Checking:${NC} $repo_name (subdirectory: $subdir)"
    echo "[$TOTAL] Checking: $repo_name (subdir: $subdir)" >> ../$LOG_FILE
    
    if check_repo_exists $repo_url $repo_name; then
        echo -e "${GREEN}✓ Repository exists${NC}"
        
        local temp_dir="temp_${repo_name}_${RANDOM}"
        if git clone --sparse $repo_url $temp_dir >> ../$LOG_FILE 2>&1; then
            cd $temp_dir
            git sparse-checkout init --cone
            git sparse-checkout set $subdir
            cd ..
            
            if [ -d "$temp_dir/$subdir" ]; then
                mv "$temp_dir/$subdir" "$target_dir/$repo_name"
                rm -rf $temp_dir
                echo -e "${GREEN}  ✓ Cloned subdirectory successfully${NC}"
                SUCCESS=$((SUCCESS + 1))
                echo "  [SUCCESS] $repo_url (subdir: $subdir)" >> ../$LOG_FILE
                echo "- ✅ **$repo_name/$subdir**: Cloned successfully" >> ../$REPORT_FILE
            else
                rm -rf $temp_dir
                echo -e "${RED}  ✗ Subdirectory not found${NC}"
                FAILED=$((FAILED + 1))
                echo "  [FAILED] $repo_url - Subdirectory $subdir not found" >> ../$LOG_FILE
                echo "- ❌ **$repo_name/$subdir**: Subdirectory not found" >> ../$REPORT_FILE
            fi
        else
            echo -e "${RED}  ✗ Clone failed${NC}"
            FAILED=$((FAILED + 1))
            echo "  [FAILED] $repo_url - Clone error" >> ../$LOG_FILE
            echo "- ❌ **$repo_name**: Clone failed" >> ../$REPORT_FILE
        fi
    else
        echo -e "${RED}✗ Repository does not exist or is private${NC}"
        FAILED=$((FAILED + 1))
        echo "  [NOT FOUND] $repo_url" >> ../$LOG_FILE
        echo "- ⚠️ **$repo_name**: Repository not found or private" >> ../$REPORT_FILE
    fi
    echo ""
}

# ============================================
# CLONE ALL REPOSITORIES
# ============================================

echo -e "${BLUE}=== Core Vibe Components ===${NC}" | tee -a ../$LOG_FILE
echo "## Core Vibe Components" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

# Your custom components
clone_repo "https://github.com/ThatsRight-ItsTJ/libraries-io-mcp-server.git" "custom-mcps" "libraries-io-mcp-server"
clone_repo "https://github.com/ThatsRight-ItsTJ/Your-PaL-MoE-v0.3.git" "custom-mcps" "Your-PaL-MoE-v0.3"
clone_repo "https://github.com/ThatsRight-ItsTJ/GitHub-File-Seek.git" "custom-mcps" "GitHub-File-Seek"
clone_repo "https://github.com/ThatsRight-ItsTJ/files-whatever.git" "custom-mcps" "files-whatever"

echo -e "${BLUE}=== MetaMCP Core ===${NC}" | tee -a ../$LOG_FILE
echo "## MetaMCP Core" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/metatool-ai/metamcp.git" "core-components" "metamcp"

echo -e "${BLUE}=== Official MCP Servers ===${NC}" | tee -a ../$LOG_FILE
echo "## Official MCP Servers" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/modelcontextprotocol/servers.git" "official-mcps" "mcp-servers"
clone_repo "https://github.com/anthropics/anthropic-mcp-servers.git" "official-mcps" "anthropic-mcp-servers"
clone_repo "https://github.com/evalstate/hf-mcp-server.git" "official-mcps" "hf-mcp-server"

echo -e "${BLUE}=== AI Provider MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## AI Provider MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/pollinations/pollinations-mcp.git" "official-mcps" "pollinations-mcp"

echo -e "${BLUE}=== Code Analysis MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Code Analysis MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/semgrep/semgrep-mcp.git" "community-mcps" "semgrep-mcp"
clone_repo "https://github.com/wrale/mcp-server-tree-sitter.git" "community-mcps" "mcp-server-tree-sitter"
clone_repo "https://github.com/radon-mcp/radon-mcp-server.git" "community-mcps" "radon-mcp-server"
clone_repo "https://github.com/langtools/langtools-mcp.git" "community-mcps" "langtools-mcp"

echo -e "${BLUE}=== Search & Discovery MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Search & Discovery MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/sourcegraph/sourcegraph-mcp.git" "community-mcps" "sourcegraph-mcp"
clone_repo "https://github.com/context7/context7-mcp.git" "community-mcps" "context7-mcp"

echo -e "${BLUE}=== Testing MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Testing MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/pytest-dev/mcp-pytest-service.git" "testing-mcps" "mcp-pytest-service"
clone_repo "https://github.com/jestjs/mcp-jest.git" "testing-mcps" "mcp-jest"
clone_repo "https://github.com/microsoft/playwright-mcp.git" "testing-mcps" "playwright-mcp"
clone_repo "https://github.com/coverage-mcp/coverage-mcp-server.git" "testing-mcps" "coverage-mcp-server"

echo -e "${BLUE}=== Database MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Database MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/prisma/prisma-mcp.git" "database-mcps" "prisma-mcp"
clone_repo "https://github.com/django/django-mcp.git" "database-mcps" "django-mcp"
clone_repo "https://github.com/sqlalchemy/sqlalchemy-mcp.git" "database-mcps" "sqlalchemy-mcp"
clone_repo "https://github.com/executeautomation/mcp-database-server.git" "database-mcps" "mcp-database-server"
clone_repo "https://github.com/supabase/supabase-mcp.git" "database-mcps" "supabase-mcp"

echo -e "${BLUE}=== Deployment MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Deployment MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/vercel/vercel-mcp.git" "deployment-mcps" "vercel-mcp"
clone_repo "https://github.com/netlify/netlify-mcp.git" "deployment-mcps" "netlify-mcp"
clone_repo "https://github.com/cloudflare/cloudflare-mcp-server.git" "deployment-mcps" "cloudflare-mcp-server"
clone_repo "https://github.com/railwayapp/railway-mcp.git" "deployment-mcps" "railway-mcp"
clone_repo "https://github.com/docker/docker-mcp.git" "deployment-mcps" "docker-mcp"

echo -e "${BLUE}=== Cloudflare Specific MCPs ===${NC}" | tee -a ../$LOG_FILE
echo "## Cloudflare Specific MCPs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/cloudflare/workers-mcp.git" "cloudflare-mcps" "workers-mcp"
clone_repo "https://github.com/cloudflare/kv-mcp.git" "cloudflare-mcps" "kv-mcp"
clone_repo "https://github.com/cloudflare/r2-mcp.git" "cloudflare-mcps" "r2-mcp"
clone_repo "https://github.com/cloudflare/d1-mcp.git" "cloudflare-mcps" "d1-mcp"

echo -e "${BLUE}=== MCP SDKs ===${NC}" | tee -a ../$LOG_FILE
echo "## MCP SDKs" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/modelcontextprotocol/python-sdk.git" "tools-sdks" "mcp-python-sdk"
clone_repo "https://github.com/modelcontextprotocol/typescript-sdk.git" "tools-sdks" "mcp-typescript-sdk"

echo -e "${BLUE}=== Frontend Dependencies ===${NC}" | tee -a ../$LOG_FILE
echo "## Frontend Dependencies" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/react-monaco-editor/react-monaco-editor.git" "frontend-deps" "react-monaco-editor"
clone_repo "https://github.com/nextauthjs/next-auth.git" "frontend-deps" "next-auth"
clone_repo "https://github.com/pmndrs/zustand.git" "frontend-deps" "zustand"
clone_repo "https://github.com/TanStack/query.git" "frontend-deps" "react-query"
clone_repo "https://github.com/cytoscape/cytoscape.js.git" "frontend-deps" "cytoscape"
clone_repo "https://github.com/d3/d3.git" "frontend-deps" "d3"
clone_repo "https://github.com/wbkd/react-flow.git" "frontend-deps" "react-flow"
clone_repo "https://github.com/radix-ui/primitives.git" "frontend-deps" "radix-ui"
clone_repo "https://github.com/tailwindlabs/tailwindcss.git" "frontend-deps" "tailwindcss"
clone_repo "https://github.com/tailwindlabs/headlessui.git" "frontend-deps" "headlessui"

echo -e "${BLUE}=== Reference Repositories ===${NC}" | tee -a ../$LOG_FILE
echo "## Reference Repositories" >> ../$REPORT_FILE
echo "" >> ../$REPORT_FILE

clone_repo "https://github.com/modelcontextprotocol/specification.git" "reference-repos" "mcp-specification"
clone_repo "https://github.com/modelcontextprotocol/examples.git" "reference-repos" "mcp-examples"
clone_repo "https://github.com/stackblitz-labs/bolt.diy.git" "reference-repos" "bolt.diy"
clone_repo "https://github.com/Kilo-Org/kilocode.git" "reference-repos" "kilocode"
clone_repo "https://github.com/getzep/graphiti.git" "reference-repos" "graphiti"

# ============================================
# SUMMARY
# ============================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Clone Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Successfully cloned:${NC} $SUCCESS repositories"
echo -e "${YELLOW}Already existed/updated:${NC} $SKIPPED repositories"
echo -e "${RED}Failed or not found:${NC} $FAILED repositories"
echo -e "${BLUE}Total processed:${NC} $TOTAL repositories"
echo ""

# Add summary to report
echo "" >> ../$REPORT_FILE
echo "## Summary" >> ../$REPORT_FILE
echo "- **Total repositories processed:** $TOTAL" >> ../$REPORT_FILE
echo "- **Successfully cloned:** $SUCCESS" >> ../$REPORT_FILE
echo "- **Already existed/updated:** $SKIPPED" >> ../$REPORT_FILE
echo "- **Failed or not found:** $FAILED" >> ../$REPORT_FILE

# Create directory structure file
echo -e "${BLUE}Creating directory structure file...${NC}"
tree -d -L 2 > directory_structure.txt 2>/dev/null || find . -type d -maxdepth 2 > directory_structure.txt

echo -e "${GREEN}✓ Complete!${NC}"
echo ""
echo "Log file: $LOG_FILE"
echo "Report file: $REPORT_FILE"
echo "Directory structure: $PROJECT_DIR/directory_structure.txt"

# Create README for the cloned project
cat > README.md << 'EOF'
# Vibe Coding Tool - Development Environment

This directory contains all cloned repositories for the Vibe Coding Tool project.

## Directory Structure

- **core-components/**: Core infrastructure components (MetaMCP)
- **custom-mcps/**: Your custom MCP servers
- **official-mcps/**: Official MCP servers from protocol maintainers
- **community-mcps/**: Community-contributed MCP servers
- **testing-mcps/**: Testing framework MCPs
- **database-mcps/**: Database-related MCPs
- **deployment-mcps/**: Deployment platform MCPs
- **cloudflare-mcps/**: Cloudflare-specific MCPs
- **frontend-deps/**: Frontend library dependencies
- **reference-repos/**: Reference implementations and specifications
- **tools-sdks/**: MCP SDKs for different languages

## Next Steps

1. Check the clone report for any missing repositories
2. Install dependencies for each component
3. Configure environment variables
4. Set up Docker containers
5. Start development!

## Files

- `directory_structure.txt`: Complete directory tree
- `*_clone_log_*.txt`: Detailed clone operation log
- `*_clone_report_*.md`: Summary report of clone operations
EOF

echo -e "${GREEN}✓ README.md created${NC}"