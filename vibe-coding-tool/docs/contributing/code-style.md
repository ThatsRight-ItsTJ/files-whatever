# Code Style Guidelines

The Vibe Coding Tool follows standard style guides for consistency and readability. Adhere to these when contributing to backend (Python) or frontend (TypeScript/JS).

## Python (Backend)

- **PEP8**: Line length 88 chars (black default), 4-space indentation.
- **Type Hints**: Use mypy for static checking; annotate all functions.
- **Imports**: isort for ordering (standard third-party local).
- **Formatting**: Black for auto-format; run before commit.
- **Docstrings**: Google style for functions/classes.
- **Naming**: snake_case for variables/functions, CamelCase for classes.

Example:
```python
def calculate_total(items: List[int]) -> int:
    """Calculate total of items.

    Args:
        items: List of numbers.

    Returns:
        Sum of items.
    """
    return sum(items)
```

Run: `black . && isort . && mypy .`.

## TypeScript/JavaScript (Frontend)

- **Airbnb Style**: ESLint config in .eslintrc.js.
- **Prettier**: For formatting; 2-space indentation, single quotes.
- **Naming**: camelCase for variables/functions, PascalCase for components.
- **TypeScript**: Strict mode; annotate props, state.
- **Imports**: Group by type (react, third-party, local).

Example:
```tsx
interface Props {
  items: number[];
}

function Total({ items }: Props): number {
  /** Calculate total of items.
   * @param items - List of numbers.
   * @returns Sum of items.
   */
  return items.reduce((sum, item) => sum + item, 0);
}
```

Run: `npm run lint && npm run format`.

## General

- **Commit Messages**: Conventional commits (feat:, fix:, docs:).
- **Comments**: Explain why, not what.
- **Files**: Unix line endings, UTF-8.

Enforce with pre-commit hooks. See [Setup](setup.md) for tools.

Back to [Contributing](index.md).