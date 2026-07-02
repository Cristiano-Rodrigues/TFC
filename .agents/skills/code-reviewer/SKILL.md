---
name: code-reviewer
description: MANDATORY post-generation review. Must be executed after ANY code changes.
---

# Code Reviewer Skill

## When to use this skill

- **ALWAYS** run this skill as the FINAL step after making ANY code changes
- This is NOT optional - it must be executed before completing a task.

## How to use it

1. Review ALL files you modified in this session for:
    - Unused imports and variables
    - Comments unless strictly necessary, remove them
    - Dead code or unreachable logic
    - Code readability issues
2. Remove any issues and linting errors found and clean up the code (npm run lint && npx tsc --noEmit)
3. Verify the code still works correctly after cleanup.
4. Ensure to use the same project standards for all files you modified.