# Pull Request Process

To submit changes, open a Pull Request (PR) on GitHub. Follow this process for smooth review and merging.

## Before Submitting

1. **Branch Naming**: Use `feat: description` or `fix: description` for conventional commits.
2. **Test Changes**: Run tests, linting (see [Code Style](code-style.md)).
3. **Update Docs**: If applicable, add to docs or update existing.
4. **Small Commits**: Keep PRs focused; one feature/fix per PR.

## Opening a PR

1. **Fork and Branch**: Fork repo, create branch from main.
2. **Push**: `git push origin your-branch`.
3. **Open PR**:
   - Title: Clear, e.g., "feat: add new MCP tool".
   - Description: 
     - What: Brief summary.
     - Why: Problem solved.
     - How: Key changes.
     - Tests: Added/updated.
     - Screenshots: For UI changes.
   - Link issues: "Closes #123".

4. **Assign Reviewers**: Tag maintainers or self-assign.

## Review Process

- **Automated Checks**: CI runs lint/test/build.
- **Review**: Maintainers review for style, tests, docs.
- **Feedback**: Address comments; push updates to branch.
- **Changes Requested**: Update and comment "@reviewer ready for re-review".

## Merging

- **Approve**: 1+ maintainer approval.
- **Merge**: Squash or rebase for clean history.
- **Post-Merge**: Delete branch, update main.

For issues: [Reporting Issues](reporting-issues.md). Thanks for contributing!

Back to [Contributing](index.md).