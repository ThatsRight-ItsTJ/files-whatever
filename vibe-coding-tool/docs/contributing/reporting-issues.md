# Reporting Issues

To report bugs or request features, use GitHub Issues. This helps the community track and resolve problems efficiently.

## Before Reporting

1. **Search Existing Issues**: Check if already reported (open/closed).
2. **Reproduce**: Verify the issue in a clean environment.
3. **Gather Info**: Note version, steps to reproduce, expected vs actual behavior, logs/screenshots.

## Creating an Issue

1. **Go to Issues**: https://github.com/ThatsRight-ItsTJ/vibe-coding-tool/issues/new.
2. **Title**: Clear and descriptive, e.g., "Task routing fails for Semgrep MCP on HF Space".
3. **Description Template**:
   - **Description**: What happens.
   - **Expected Behavior**: What should happen.
   - **Actual Behavior**: What does happen.
   - **Steps to Reproduce**: Numbered list.
   - **Environment**: OS, Python/Node version, Docker yes/no.
   - **Logs/Screenshots**: Paste relevant logs, attach images.
   - **Additional Context**: Related issues/PRs.

Example:
```
**Description**
When running Semgrep task, it fails with 503.

**Expected Behavior**
Task executes successfully.

**Actual Behavior**
503 MCP unavailable.

**Steps to Reproduce**
1. Deploy Semgrep MCP to HF.
2. Run task "Run Semgrep".
3. Error in history.

**Environment**
- OS: macOS 14
- Python: 3.11
- Docker: yes

**Logs**
[Error log here]

**Additional Context**
Cloned from main, HF Space URL: ...
```

4. **Submit**: Click "Submit new issue".

## Labels and Milestones

- Labels added by maintainers (bug, enhancement, question).
- Assign to self if contributor.

## Triage

- Issues reviewed weekly.
- Good first issue: Labeled for beginners.
- Priority: P0 (critical), P1 (high), etc.

Thanks for helping improve Vibe Coding Tool!

Back to [Contributing](index.md).