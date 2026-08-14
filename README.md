# Claude Marketplace

Claude Code extensions by AGDevX — skills and hooks for safer, smoother workflows.

## What is This?

This marketplace provides reusable extensions for [Claude Code](https://claude.com/claude-code) that add functionality through:

- **Skills**: Slash commands you invoke with `/skill-name`
- **Hooks**: Automated actions triggered by events (e.g., before/after a tool runs)
- **Plugins**: Bundled collections of skills and hooks

## Installation

1. Install the marketplace:

```bash
claude plugin marketplace add agdevx/claude-marketplace
```

2. Install the plugin:

```bash
claude plugin install agdevx-toolkit-plugin
```

## AGDevX Toolkit Plugin

**Version:** 0.0.6
**Location:** `./plugins/agdevx-toolkit-plugin`

Developer toolkit — hooks and skills for safer, smoother Claude Code workflows.

### Skills

- **`/pr-summary [target-branch]`** — Analyzes branch changes and generates a concise PR summary ready to paste into GitHub/Azure DevOps. Copies to clipboard. Defaults to comparing against `main`.

- **`/explain-code`** — Explains code with ASCII diagrams, everyday analogies, step-by-step walkthroughs, and common gotchas.

- **`/copy-to-clipboard`** — Cross-platform clipboard support (Windows, macOS, Linux). Works with multi-line content, code snippets, and command output.

- **`/read-relevant-docs`** — Detects your project's tech stack and loads matching documentation from `~/.claude/docs/*`. Useful after clearing or compacting context.

- **`/list`** — Collaborative note-taking mode for capturing task items, brain dumps, and collected issues without acting on them. Tracks items in-context for speed — no file writes until you're ready.

### Hooks

- **`protect-main-branch`** _(PreToolUse)_ — Prevents accidental modifications to protected branches (`main`, `master`, `production`, `prod`, `release`). Blocks file writes and dangerous git commands when on a protected branch. Also blocks deletion of protected branches from any branch. Suggests branch names based on file context and extracts Jira issue IDs for branch naming. Read-only operations are allowed. Files outside the repository are automatically excluded from protection.

- **`delete-nul-files`** _(PostToolUse)_ — Automatically detects and removes `NUL` files that Windows sometimes creates when a reserved device name is inadvertently used as a filename. Runs after `Write`, `Edit`, `MultiEdit`, and `Bash` operations.

## Prerequisites

- Node.js (for hook scripts)
- [Claude Code](https://claude.com/claude-code)

## Managing Plugins

The marketplace configuration is in `.claude-plugin/marketplace.json`. Plugins are registered there and automatically discovered by Claude Code.

## License

MIT License - see [LICENSE](LICENSE) for details

Copyright (c) 2026 AGDevX

---

**Note:** This marketplace is designed for [Claude Code](https://claude.com/claude-code). Make sure you have Claude Code and Node.js installed to use these plugins.
