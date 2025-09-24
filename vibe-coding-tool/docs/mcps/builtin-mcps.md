# Built-in MCPs

Built-in MCPs are core, off-the-shelf servers included in the Vibe Coding Tool for essential tasks like code analysis and parsing. They are deployed to HF Spaces using the worker template and added to the registry with standard capabilities. These provide foundational features without custom development.

From the clone report and plans, key built-in MCPs include Semgrep for security scanning and Tree-sitter for syntax analysis. They are lightweight for oracle or heavy for Spaces.

## Semgrep MCP

**Description**: Off-the-shelf MCP for static code analysis and security scanning. Wraps Semgrep CLI for vulnerability detection, code quality checks.

**Capabilities**:
- "code_analysis": Run scans on files/repos.
- "security_scan": Detect vulnerabilities, secrets.

**Deployment**:
1. Clone template: `cp -r hfspace-worker-template/worker semgrep-mcp`.
2. Add to requirements.txt: `semgrep==1.0`.
3. Implement tool in main.py:
   ```python
   @mcp.tool()
   async def semgrep_scan(files: list, rules: str = "p/security-audit") -> dict:
       """Run Semgrep scan"""
       from semgrep import cli
       result = cli.invoke_scan(files, rules=rules)
       return {"issues": result.json()}
   ```
4. mcp.json:
   ```json
   {
     "tools": {
       "semgrep_scan": {
         "name": "semgrep_scan",
         "description": "Static code analysis",
         "inputSchema": {
           "type": "object",
           "properties": {
             "files": {"type": "array", "items": {"type": "string"}},
             "rules": {"type": "string", "default": "p/security-audit"}
           }
         }
       }
     }
   }
   ```
5. Build/deploy to HF Space as in [HF Spaces](../deployment/hf-spaces.md).
6. Add to registry: "id": "semgrep-mcp", "capabilities": ["code_analysis", "security_scan"].

**Usage**:
- Task: "Run Semgrep on project" – scans for issues, suggests fixes.
- Results: JSON with issues; integrate with editor for highlights.

**Health**: /health returns Semgrep version/status.

## Tree-sitter MCP

**Description**: Off-the-shelf MCP for syntax tree parsing and language support. Wraps Tree-sitter for AST generation, syntax highlighting.

**Capabilities**:
- "syntax_parse": Generate AST for code.
- "language_support": Provide grammar for editors.

**Deployment**:
1. Clone template: `cp -r hfspace-worker-template/worker tree-sitter-mcp`.
2. Add to requirements.txt: `tree-sitter==0.20`, `tree-sitter-languages`.
3. Implement tool:
   ```python
   @mcp.tool()
   async def parse_syntax(code: str, language: str = "python") -> dict:
       """Parse code with Tree-sitter"""
       from tree_sitter import Language, Parser
       LANGUAGE = Language('build/my-languages.so', 'python')  # Load grammar
       parser = Parser()
       parser.set_language(LANGUAGE)
       tree = parser.parse(bytes(code, "utf8"))
       return {"ast": tree.root_node.sexp()}
   ```
4. mcp.json:
   ```json
   {
     "tools": {
       "parse_syntax": {
         "name": "parse_syntax",
         "description": "Syntax tree parsing",
         "inputSchema": {
           "type": "object",
           "properties": {
             "code": {"type": "string"},
             "language": {"type": "string", "default": "python"}
           }
         }
       }
     }
   }
   ```
5. Build/deploy to HF.
6. Registry: "id": "tree-sitter-mcp", "capabilities": ["syntax_parse"].

**Usage**:
- Task: "Parse this file" – returns AST for KG or editor linting.
- Integration: Monaco uses for highlighting.

**Health**: /health returns supported languages.

These built-ins cover 80% of analysis needs. For custom: [Custom MCPs](custom-mcps.md). Development: [MCP Development](../developer/mcp-development.md).

Back to [MCP Servers](index.md).