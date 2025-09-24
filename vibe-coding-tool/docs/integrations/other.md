# Other Integrations

The Vibe Coding Tool supports additional integrations beyond core services, such as Libraries.io for dependency management. This section covers setup and usage for these. For core, see [GitHub](github.md), [Hugging Face](huggingface.md), [Cloudflare](cloudflare.md).

These are implemented via backend services or MCPs, with OAuth/API keys.

## Libraries.io Integration

**Description**: Dependency analysis and package discovery across ecosystems (npm, PyPI, Maven). Uses the Libraries.io MCP for scans, suggestions, and vulnerability checks. Ideal for "Analyze Dependencies" tasks.

**Capabilities**:
- Package search and trends.
- Repo dependency scan.
- Vulnerability alerts and updates.

**Setup**:
1. Sign up at libraries.io, get API key (free tier available).
2. Add to .env:
   ```
   LIBRARIES_IO_API_KEY=your-libraries-io-key
   ```
3. Restart backend.
4. Deploy MCP: See [Custom MCPs](../mcps/custom-mcps.md#librariesio-mcp-server).
5. Add to registry: "id": "libraries-io", "capabilities": ["package_discovery", "dependency_analysis"].

**Usage**:
- UI: Dashboard > Tools > "Analyze Dependencies" > Select repo/platform.
- Task: Routes to Libraries.io MCP; input repo_url, platform (e.g., "npm").
- Results: JSON with deps, versions, vulnerabilities, update suggestions.
- Example API (via MCP):
  ```
  POST /api/mcps/libraries-io/execute
  {
    "tool": "analyze_dependencies",
    "arguments": {"repo_url": "https://github.com/user/my-app", "platform": "npm"}
  }
  ```
- Output: {"dependencies": [...], "vulnerabilities": [...], "updates": [...] }.

**Benefits**:
- Security: Detect outdated/vulnerable packages.
- Maintenance: Suggest upgrades across ecosystems.
- Integration: Use in workflows for pre-commit scans.

**Troubleshooting**:
- API Key Invalid: Regenerate at libraries.io.
- Scan Fails: Check repo public or token access.
- Large Repos: Uses pointers for results.

For more integrations, extend via [Extending](../developer/extending.md#custom-integrations).

Back to [Integrations](index.md).